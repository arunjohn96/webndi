#include "sendvideo.h"

CSendVideo::CSendVideo(Properties& properties)
{
    CUtil::GetProperty(m_id, properties, "id");
    CUtil::GetProperty(m_channel_name, properties, "channelName");
    CUtil::GetProperty(m_xres, properties, "xres");
    CUtil::GetProperty(m_yres, properties, "yres");
    CUtil::GetProperty(m_framerate, properties, "frameRate");

    NDIlib_send_create_t descriptor;
    descriptor.p_ndi_name = m_channel_name.c_str();
    m_sender = NULL;

    CUtil::log(properties, "initializing audio");
    cout<<"  m_xres: "<<m_xres
        <<endl<<"  m_yres: "<<m_yres
        <<endl<<"  m_framerate: "<<m_framerate
        <<endl; 

    if (NDIlib_initialize())
    {
        m_sender = NDIlib_send_create(&descriptor);
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

int CSendVideo::execute(Properties& properties, const Napi::CallbackInfo& info)
{
    if (!m_sender) return 0;
    if (info[2].IsArrayBuffer()) 
    {
        Napi::ArrayBuffer framebuffer = info[2].As<Napi::ArrayBuffer>();
        frame.p_data = reinterpret_cast<uint8_t*>(framebuffer.Data());
        NDIlib_send_send_video_v2(m_sender, &frame);
    }
    return 0;
}

