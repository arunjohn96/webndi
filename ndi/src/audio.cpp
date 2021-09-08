#include "audio.h"

CAudio::CAudio(Properties& properties)
{
    m_channel_name   = GetProperty(properties, "channelName").c_str();
    m_sample_rate    = atoi(GetProperty(properties, "sampleRate").c_str());
    m_no_of_channels = atoi(GetProperty(properties, "noOfChannels").c_str());
    m_no_of_samples  = atoi(GetProperty(properties, "noOfSamples").c_str());
    m_channel_stride = atol(GetProperty(properties, "channelStride").c_str());

    cout <<endl <<"initializing audio channel " <<m_channel_name <<endl ;

    NDIlib_send_create_t descriptor;
    descriptor.p_ndi_name = m_channel_name.c_str() ;
    descriptor.clock_audio = true;
    m_sender = NULL;

    if (NDIlib_initialize())
    {
        m_sender = NDIlib_send_create(&descriptor);
        cout <<endl <<"initialized sender successfully for audio channel " <<m_channel_name <<endl ;
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

int CAudio::send(uint8_t* buffer, size_t bsize)
{
    NDIlib_audio_frame_v2_t frame;

    frame.sample_rate             = m_sample_rate;                      // 48000
    frame.no_channels             = m_no_of_channels;                   // 1
    frame.no_samples              = m_no_of_samples;                    // 1920
    frame.channel_stride_in_bytes = m_no_of_samples * sizeof(float);    // 1920 * sizeof(float);
    frame.p_data = (float*)malloc( m_no_of_samples * m_no_of_channels * sizeof(float));

	size_t total_samples = bsize/4 ;
	float* p_channel = (float*)((uint8_t*)frame.p_data) ;

// 	for(unsigned int i=0; i<total_samples ;i++)
// 	{
//     	unsigned char sense [] = {buffer[i*4], buffer[i*4+1], buffer[i*4+2], buffer[i*4+3]};
//         float pulse = *(float *)(sense);
// //		int index = (i%m_no_of_channels)*m_no_of_samples+(i/m_no_of_channels) ;
// //		p_channel[index] = pulse ;
// 		p_channel[i] = pulse ;
//
// //		printf ("\t%d => [ %d ] %0.21f\t", i, index, pulse) ;
//
// 	}


    NDIlib_send_send_audio_v2(m_sender, &frame);
    //free(frame.p_data);

    cout << endl <<  "a" ;

    return 0;
}
