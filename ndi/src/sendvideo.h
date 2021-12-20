#ifndef CSENDVIDEO_H
#define CSENDVIDEO_H

#include <cstring>

#include <Processing.NDI.Lib.h>
#include <Processing.NDI.Send.h>
#include <Processing.NDI.Lib.cplusplus.h>

#include "ndi.h"
#include "channel.h"
#include <iostream>

using namespace std;

class CSendVideo : public CStream
{
public:
    CSendVideo();
    ~CSendVideo();
    CSendVideo(Properties& properties);

    std::string id();
    int command(Properties& properties); 
    int execute(Properties& properties, const Napi::CallbackInfo& info);

private:
    NDIlib_send_instance_t      m_sender;
    std::string                 m_id;
    std::string                 m_channel_name;
    int                         m_xres;
    int                         m_yres;
    int                         m_framerate;
    long                        m_channel_stride;
    NDIlib_video_frame_v2_t     frame;
};

#endif // CSENDVIDEO_H

