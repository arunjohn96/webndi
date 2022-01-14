#include "receivevideo.h"
#include <thread>

CReceiveVideo::CReceiveVideo(Properties& properties)
{
	SetModeAndType("receive", "video");
    CUtil::GetProperty(m_id, properties, "id");
    CUtil::GetProperty(m_channel_name, properties, "channelName");
    CUtil::GetProperty(m_channel_search_max_wait_time, properties, "channelSearchMaxWaitTime");   // 60
    CUtil::GetProperty(m_interval, properties, "pollInterval");   // 0.03
    
    m_receiver = NULL;
    if (!m_interval) m_interval=0.0;
    
    CUtil::log(properties, "initializing receive video");
    cout<<"  m_channel_search_max_wait_time: "<<m_channel_search_max_wait_time <<endl; 

    m_receiver = CNdi::CreateReceiver(m_channel_name, m_channel_search_max_wait_time);
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

int CReceiveVideo::command(Properties& properties)
{
    m_command = CUtil::GetCommand(properties) ;
    return 0;
}

int CReceiveVideo::execute(uint8_t*& buffer, size_t& bsize)
{
    if (!m_receiver) return 0;
    NDIlib_frame_type_e frame_type;
    NDIlib_video_frame_v2_t video_frame;
	frame_type = NDIlib_recv_capture_v2(m_receiver, &video_frame, nullptr, nullptr, 1000);
    if(NDIlib_frame_type_video==frame_type)
    {
		cout << "xres:"<<video_frame.xres<<" yres:"<<video_frame.yres<<" Type:" << getVideoType(video_frame.FourCC) << endl ;
	    bsize = video_frame.yres * video_frame.line_stride_in_bytes ;
        buffer = (uint8_t*)malloc(bsize+1);
        memcpy(buffer, video_frame.p_data, bsize);
        NDIlib_recv_free_video_v2(m_receiver, &video_frame);
    }
	return 0 ;
}

const char * CReceiveVideo::getVideoType(NDIlib_FourCC_video_type_e type)
{
	switch(type)
	{
		case NDIlib_FourCC_video_type_UYVY :
			return "NDIlib_FourCC_video_type_UYVY";
		case NDIlib_FourCC_video_type_UYVA :
			return "NDIlib_FourCC_video_type_UYVA";
		case NDIlib_FourCC_video_type_P216 :
			return "NDIlib_FourCC_video_type_P216";
		case NDIlib_FourCC_video_type_PA16 :
			return "NDIlib_FourCC_video_type_PA16";
		case NDIlib_FourCC_video_type_YV12 :
			return "NDIlib_FourCC_video_type_YV12";
		case NDIlib_FourCC_video_type_I420 :
			return "NDIlib_FourCC_video_type_I420";
		case NDIlib_FourCC_video_type_NV12 :
			return "NDIlib_FourCC_video_type_NV12";
		case NDIlib_FourCC_video_type_BGRA :
			return "NDIlib_FourCC_video_type_BGRA";
		case NDIlib_FourCC_type_BGRX :
			return "NDIlib_FourCC_type_BGRX";
		case NDIlib_FourCC_video_type_RGBA :
			return "NDIlib_FourCC_video_type_RGBA";
		case NDIlib_FourCC_video_type_RGBX :
			return "NDIlib_FourCC_video_type_RGBX";
		default:
			return "Unknown";
	}
}
