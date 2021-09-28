#ifndef CNDI_H
#define CNDI_H

#include "util.h"
#include <iostream>

class CNdi
{
	public:

	static size_t GetLength(NDIlib_audio_frame_v2_t frame)
	{
		return (frame.no_channels * frame.channel_stride_in_bytes) ;
	}

	static size_t GetLength(NDIlib_video_frame_v2_t frame)
	{
		return (frame.xres * frame.yres * 4 /* 4 RGBA bytes*/) ;
	}

	static NDIlib_recv_instance_t CreateReceiver(std::string source_name, int max_wait_time=60)
	{

		NDIlib_find_instance_t p_finder = NDIlib_find_create_v2();
		if(!p_finder) return NULL ;

		int wait_time = 0;
		uint32_t no_of_sources = 0;
		const NDIlib_source_t* p_source = NULL;
		const NDIlib_source_t* p_sources = NULL;

		while(!p_source && wait_time < max_wait_time)
		{
			wait_time++;
			CUtil::log("Serching for all NDI sources ...");
			NDIlib_find_wait_for_sources(p_finder, 1000/* 1 second */);
			p_sources = NDIlib_find_get_current_sources(p_finder, &no_of_sources);
			for(uint32_t index=0; index<no_of_sources; index++)
			{
				std::string ndi_source_name = p_sources[index].p_ndi_name ;
				CUtil::log(" index:" + std::to_string(index) + " name:" + ndi_source_name);
				if(ndi_source_name.find("("+source_name+")")!=std::string::npos) 
				{
					p_source = &p_sources[index];
					break;
				}
			}
		}
		
		if(!p_source) return NULL;

		NDIlib_recv_instance_t p_receiver =  NDIlib_recv_create_v3();
		if(!p_receiver) return NULL;

        NDIlib_recv_connect(p_receiver, p_source) ;
		NDIlib_find_destroy(p_finder);
		return p_receiver ;
	}
};

#endif // CNDI_H
