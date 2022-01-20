#include "receivevideo.h"
#include <thread>

CReceiveVideo::CReceiveVideo(Properties& properties)
{
    SetModeAndType("receive", "video");
    CUtil::GetProperty(m_id, properties, "id");
    CUtil::GetProperty(m_channel_name, properties, "channelName");
    CUtil::GetProperty(m_channel_group, properties, "channelGroup");
    CUtil::GetProperty(m_channel_ips, properties, "channelIps");
    CUtil::GetProperty(m_channel_search_max_wait_time, properties, "channelSearchMaxWaitTime");   // 60
    CUtil::GetProperty(m_interval, properties, "pollInterval");   // 0.03
    CUtil::GetProperty(m_bandwidth, properties, "bandWidth");   // 0.03
    
    m_receiver = NULL;
    if (!m_interval) m_interval=0.0;
    
    CUtil::log(properties, "initializing receive video");
    cout<<"  m_channel_search_max_wait_time: "<<m_channel_search_max_wait_time <<endl; 

    m_receiver = CNdi::CreateReceiver(m_channel_name, m_channel_group, m_channel_ips, m_channel_search_max_wait_time, m_bandwidth);
    if(!m_receiver) {
       CUtil::log(properties, "failed receiver creation for video") ;
    }
    else{
       CUtil::log("successfully initialized receiver");
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

std::string CReceiveVideo::name()
{
    return m_channel_name;
}

std::string CReceiveVideo::group()
{
    return m_channel_group;
}

int CReceiveVideo::execute(uint8_t*& buffer, size_t& bsize)
{
    if (!m_receiver) return 0;
    NDIlib_frame_type_e frame_type;
    NDIlib_video_frame_v2_t video_frame;
    frame_type = NDIlib_recv_capture_v2(m_receiver, &video_frame, nullptr, nullptr, 1000);
    if(NDIlib_frame_type_video==frame_type)
    {
        // cout << "xres:"<<video_frame.xres<<" yres:"<<video_frame.yres<<" Type:" << getVideoType(video_frame.FourCC) << endl ;
        bsize = video_frame.yres * video_frame.line_stride_in_bytes ;
        buffer = (uint8_t*)malloc(bsize+1);
        memcpy(buffer, video_frame.p_data, bsize);
        NDIlib_recv_free_video_v2(m_receiver, &video_frame);
    }
    return 0 ;
}

