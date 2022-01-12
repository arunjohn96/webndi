#include "receiveaudio.h"
#include <thread>

CReceiveAudio::CReceiveAudio(Properties& properties)
{
    CUtil::GetProperty(m_id, properties, "id");
    CUtil::GetProperty(m_channel_name, properties, "channelName");
    CUtil::GetProperty(m_channel_search_max_wait_time, properties, "channelSearchMaxWaitTime");   // 60
    CUtil::GetProperty(m_interval, properties, "pollInterval");   // 0.03

    m_receiver = NULL;
    if (!m_interval) m_interval=0.0;

    CUtil::log(properties, "initializing receive audio");
    cout<<"  m_channel_search_max_wait_time: "<<m_channel_search_max_wait_time <<endl;

    m_receiver = CNdi::CreateReceiver(m_channel_name, m_channel_search_max_wait_time);
    if(!m_receiver) {
       CUtil::log(properties, "failed receiver creation for audio") ;
    }
    else{
        CUtil::log("successfully initialized receiver");
    }
}

CReceiveAudio::~CReceiveAudio()
{
    if (m_receiver)
    {
        cout<<"destroying ndi dependencies for audio channel "<<m_id<<endl;
        NDIlib_send_destroy(m_receiver);
        NDIlib_destroy();
    }
}

std::string CReceiveAudio::id()
{
    return m_id;
}

int CReceiveAudio::command(Properties& properties)
{
    m_command = CUtil::GetCommand(properties) ;
    return 0;
}

int CReceiveAudio::execute(uint8_t*& buffer, size_t& bsize)
{
    if (!m_receiver) return 0;
    NDIlib_frame_type_e frame_type;
    NDIlib_audio_frame_v2_t audio_frame;
	frame_type = NDIlib_recv_capture_v2(m_receiver, nullptr, &audio_frame, nullptr, 1000);
	if(NDIlib_frame_type_audio==frame_type)
	{

		// Example: no_channels=2 channel_stride_in_bytes=23040 no_samples=5760 sample_rate=48000
		bsize = audio_frame.no_channels * audio_frame.channel_stride_in_bytes;
		buffer = (uint8_t*)malloc(bsize+1);
		memcpy(buffer, (uint8_t*)audio_frame.p_data, bsize);
		NDIlib_recv_free_audio_v2(m_receiver, &audio_frame);
	}
    return 0;
}
