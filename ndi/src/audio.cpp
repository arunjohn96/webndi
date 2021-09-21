#include "audio.h"

CAudio::CAudio(Properties& properties)
{
    m_channel_name         = GetProperty(properties, "channelName").c_str();
    m_sample_rate          = atoi(GetProperty(properties, "sampleRate").c_str());         // 48000
    m_no_of_channels       = atoi(GetProperty(properties, "noOfChannels").c_str());       // 2
    m_bytes_per_sample     = atol(GetProperty(properties, "bytesPerSample").c_str());     // 4

    m_web_frame_rate       = atol(GetProperty(properties, "webFrameRate").c_str());       // 375
    m_web_channel_stride   = atol(GetProperty(properties, "webChannelStride").c_str());   // 128

	m_ndi_channel_stride =  m_web_frame_rate * m_web_channel_stride ;

	m_no_of_web_frames = 0;
	no_of_samples_in_ndi_channel_frame = 0;

    NDIlib_send_create_t descriptor;
    descriptor.p_ndi_name = m_channel_name.c_str() ;
    descriptor.clock_audio = true;
    m_sender = NULL;
	
    cout<<"Initializing audio channel "<<m_channel_name
		<<endl<<"  m_sample_rate: "<<m_sample_rate
		<<endl<<"  m_no_of_channels: "<<m_no_of_channels
		<<endl<<"  m_bytes_per_sample: "<<m_bytes_per_sample
		<<endl<<"  m_web_frame_rate: "<<m_web_frame_rate
		<<endl<<"  m_web_channel_stride: "<<m_web_channel_stride
		<<endl<<"  m_ndi_channel_stride: "<<m_ndi_channel_stride
		<<endl<<"  ndi buffer size(float): "<<m_ndi_channel_stride * m_no_of_channels 
		<<endl;

    if (NDIlib_initialize())
    {
        m_sender = NDIlib_send_create(&descriptor);
        cout <<endl <<"initialized sender successfully for audio channel " <<m_channel_name <<endl ;

		frame.sample_rate             = m_sample_rate;                              // 48000
		frame.no_channels             = m_no_of_channels;                           // 2
		frame.no_samples              = m_ndi_channel_stride;                       // 375 * 128
		frame.channel_stride_in_bytes = m_ndi_channel_stride * sizeof(float);       // 48000 * sizeof(float);
		frame.p_data                  = (float*)malloc( m_ndi_channel_stride * m_no_of_channels * sizeof(float));
		p_ndi_channel                 = (float*)((uint8_t*)frame.p_data) ;
		SetFrame();
    }
    else
        cout <<endl <<"failed to initialize sender for audio channel " <<m_channel_name <<endl ;

}

CAudio::~CAudio()
{
    if (m_sender)
    {
        NDIlib_send_destroy(m_sender);
        NDIlib_destroy();
    }
}

std::string CAudio::GetProperty(Properties& properties, std::string key)
{
    Properties::const_iterator it = properties.find(key) ;
    return ((it != properties.end()) ? it -> second : "0") ;
}

void CAudio::SetFrame()
{
	m_no_of_web_frames=0;
	no_of_samples_in_ndi_channel_frame=0;
	memset((float*)frame.p_data, 0.0f, m_ndi_channel_stride * m_no_of_channels * sizeof(float));
}

int CAudio::send(uint8_t* buffer, size_t bsize)
{
    if ((int)bsize!=(m_bytes_per_sample*m_no_of_channels*m_web_channel_stride))
	{
	    cout<<"Invalid frame configs" ;
		return 0 ;
	}

	float * p_pulse = (float*)(buffer) ;
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
	m_no_of_web_frames++ ;
    return 0;
}
