#include "receivevideo.h"
#include <thread>

CReceiveVideo::CReceiveVideo(Properties& properties)
{
    CUtil::GetProperty(m_id, properties, "id");
    CUtil::GetProperty(m_channel_name, properties, "channelName");
    CUtil::GetProperty(m_channel_search_max_wait_time, properties, "channelSearchMaxWaitTime");   // 60
    CUtil::GetProperty(m_interval, properties, "pollInterval");   // 0.03
    
    m_receiver = NULL;
    if (!m_interval) m_interval=0.0;
    
    CUtil::log(properties, "initializing receive video");
    cout<<"  m_channel_search_max_wait_time: "<<m_channel_search_max_wait_time <<endl; 

    if (NDIlib_initialize())
    {
        m_receiver = CNdi::CreateReceiver(m_channel_name, m_channel_search_max_wait_time);
        if(!m_receiver) {
           CUtil::log(properties, "failed receiver creation for video") ;
        }
        else{
           CUtil::log("successfully initialized receiver");
        }
    }

}

CReceiveVideo::~CReceiveVideo()
{
    if (m_receiver)
    {
        cout<<"destroying ndi dependencies for video channel "<<m_id<<endl;
        NDIlib_send_destroy(m_receiver);
        NDIlib_destroy();
    }
}

std::string CReceiveVideo::id()
{
    return m_id;
}

int CReceiveVideo::command(Properties& properties)
{
    m_command = CUtil::GetCommand(properties) ;
    return 0;
}

int CReceiveVideo::execute(Properties& properties, const Napi::CallbackInfo& info)
{
    if (!m_receiver) return 0;

    Napi::Env env = info.Env();
    Napi::Function emitter = info[2].As<Napi::Function>();
    Napi::String callback = Napi::String::New(env, "receive");

    m_command = ReceiveVideo;
    NDIlib_frame_type_e frame_type;
    NDIlib_video_frame_v2_t video_frame;

    while(m_command==ReceiveVideo)
    {
        frame_type = NDIlib_recv_capture_v2(m_receiver, &video_frame, nullptr, nullptr, 5000);
        if(NDIlib_frame_type_video==frame_type)
        {
            size_t bsize = CNdi::GetLength(video_frame);
            uint8_t* video_data = (uint8_t*)malloc(bsize);
            memcpy(video_data, video_frame.p_data, bsize);

            Napi::ArrayBuffer video_buffer = Napi::ArrayBuffer::New(env, video_data, bsize);
            emitter({callback, video_buffer});

            CUtil::sleep(m_interval);
            if(!video_buffer.IsDetached()) video_buffer.Detach();
            NDIlib_recv_free_video_v2(m_receiver, &video_frame);
        }    
    }
	NDIlib_recv_free_video_v2(m_receiver, &video_frame);
	return 0 ;
}

