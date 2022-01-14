#include "sendvideo.h"

CSendVideo::CSendVideo(Properties& properties)
{
	SetModeAndType("send", "video");
    CUtil::GetProperty(m_id, properties, "id");
    CUtil::GetProperty(m_channel_name, properties, "channelName");
    CUtil::GetProperty(m_xres, properties, "xres");
    CUtil::GetProperty(m_yres, properties, "yres");
    CUtil::GetProperty(m_framerate, properties, "frameRate");

    CUtil::log(properties, "initializing audio");
    cout<<"  m_xres: "<<m_xres
        <<endl<<"  m_yres: "<<m_yres
        <<endl<<"  m_framerate: "<<m_framerate
        <<endl; 

	m_sender = CNdi::CreateSender(m_channel_name) ;
	if (m_sender)
	{
        CUtil::log(properties, "created sender for video");

        frame.xres = m_xres;
        frame.yres = m_yres;
        frame.FourCC = NDIlib_FourCC_type_RGBA;
        frame.line_stride_in_bytes = m_xres * 4;
    }
    else
        CUtil::log(properties, "failed sender creation for video") ;

}

CSendVideo::~CSendVideo()
{
    if (m_sender)
    {
        cout<<"destroying ndi dependencies for video channel "<<m_id<<endl;
        NDIlib_send_destroy(m_sender);
        NDIlib_destroy();
    }
}

std::string CSendVideo::id()
{
    return m_id;
}

int CSendVideo::command(Properties& properties)
{
    return 0;
}

int CSendVideo::execute(uint8_t*& buffer, size_t& bsize)
{
    if (!m_sender || !bsize) return 0;
	frame.p_data = buffer;
	NDIlib_send_send_video_v2(m_sender, &frame);
    return 0;
}

