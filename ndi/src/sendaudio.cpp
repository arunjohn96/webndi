#include "sendaudio.h"

CSendAudio::CSendAudio(Properties& properties)
{
	SetModeAndType("send", "audio");
    CUtil::GetProperty(m_id, properties, "id");
    CUtil::GetProperty(m_channel_name, properties, "channelName");             // 48000
    CUtil::GetProperty(m_sample_rate, properties, "sampleRate");               // 2
    CUtil::GetProperty(m_no_of_channels, properties, "noOfChannels");          // 4
    CUtil::GetProperty(m_bytes_per_sample, properties, "bytesPerSample");
    CUtil::GetProperty(m_web_frame_rate, properties, "webFrameRate");          // 375
    CUtil::GetProperty(m_web_channel_stride, properties, "webChannelStride");  // 128

    m_ndi_channel_stride =  m_web_frame_rate * m_web_channel_stride;

    m_no_of_web_frames = 0;
    no_of_samples_in_ndi_channel_frame = 0;

    CUtil::log(properties, "initializing audio");
    cout<<"  m_sample_rate: "<<m_sample_rate
        <<endl<<"  m_no_of_channels: "<<m_no_of_channels
        <<endl<<"  m_bytes_per_sample: "<<m_bytes_per_sample
        <<endl<<"  m_web_frame_rate: "<<m_web_frame_rate
        <<endl<<"  m_web_channel_stride: "<<m_web_channel_stride
        <<endl<<"  m_ndi_channel_stride: "<<m_ndi_channel_stride
        <<endl<<"  ndi buffer size(float): "<<m_ndi_channel_stride * m_no_of_channels
        <<endl; 

	m_sender = CNdi::CreateSender(m_channel_name) ;
	if (m_sender)
	{
        CUtil::log(properties, "Created sender for audio");
        frame.sample_rate             = m_sample_rate;                              // 48000
        frame.no_channels             = m_no_of_channels;                           // 2
        frame.no_samples              = m_ndi_channel_stride;                       // 375 * 128
        frame.channel_stride_in_bytes = m_ndi_channel_stride * sizeof(float);       // 48000 * sizeof(float);
        frame.p_data                  = (float*)malloc( m_ndi_channel_stride * m_no_of_channels * sizeof(float));
        p_ndi_channel                 = (float*)((uint8_t*)frame.p_data);
        SetFrame();
	}
    else
        CUtil::log(properties, "failed sender creation for audio") ;

}

CSendAudio::~CSendAudio()
{
    if (m_sender)
    {
        cout<<"destroying ndi dependencies for audio channel "<<m_id<<endl;
        free(frame.p_data);
        NDIlib_send_destroy(m_sender);
        NDIlib_destroy();
    }
}

std::string CSendAudio::id()
{
    return m_id;
}

int CSendAudio::command(Properties& properties)
{
    return 0;
}

int CSendAudio::execute(uint8_t*& buffer, size_t& bsize)
{
    if (!m_sender) return 0;

    if (bsize<=0 || (int)bsize!=(m_bytes_per_sample*m_no_of_channels*m_web_channel_stride))
    {
        cout<<"invalid frame configs";
        return 0;
    }

    float * p_pulse = (float*)(buffer);
    if (m_no_of_web_frames >=m_web_frame_rate)
    {
        NDIlib_send_send_audio_v2(m_sender, &frame);
        SetFrame();
    }

    for(int sample=0; sample<m_web_channel_stride; sample++)
    {
        for(int channel=0; channel<m_no_of_channels; channel++)
        {
            p_ndi_channel[channel*m_ndi_channel_stride+no_of_samples_in_ndi_channel_frame]=p_pulse[channel*m_web_channel_stride+sample];
        }
        no_of_samples_in_ndi_channel_frame++;
    }
    m_no_of_web_frames++;
    return 0;
}

void CSendAudio::SetFrame()
{
    m_no_of_web_frames=0;
    no_of_samples_in_ndi_channel_frame=0;
    memset((float*)frame.p_data, 0.0f, m_ndi_channel_stride * m_no_of_channels * sizeof(float));
}

