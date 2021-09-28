#ifndef CSENDAUDIO_H
#define CSENDAUDIO_H

#include <cstring>

#include <Processing.NDI.Lib.h>
#include <Processing.NDI.Send.h>
#include <Processing.NDI.Lib.cplusplus.h>

#include "channel.h"
#include <iostream>

using namespace std;

class CSendAudio : public CStream
{
public:
    CSendAudio();
    ~CSendAudio();
    CSendAudio(Properties& properties);

    std::string id(); 
    int command(Properties& properties); 
    int execute(Properties& properties, const Napi::CallbackInfo& info);

private:
    void SetFrame();
    NDIlib_send_instance_t  m_sender;
    std::string             m_id;
    std::string             m_channel_name;
    int                     m_sample_rate;
    int                     m_no_of_channels;
    int                     m_bytes_per_sample;
    int                     m_web_frame_rate;
    long                    m_ndi_channel_stride;
    int                     m_web_channel_stride;
    int                     m_no_of_web_frames;
    int                     m_no_of_ndi_samples;
    int                     no_of_samples_in_ndi_channel_frame;
    float*                  p_ndi_channel;
    NDIlib_audio_frame_v2_t frame;


};

#endif // CSENDAUDIO_H

