#ifndef CNDI_H
#define CNDI_H

#include "util.h"
#include <iostream>

class CNdi
{
	public:

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

	static NDIlib_send_create_t CreateSender(std::string channel_name)
	{
		NDIlib_send_create_t sender = NULL;
		NDIlib_send_create_t descriptor;
		descriptor.p_ndi_name = channel_name.c_str();
		descriptor.clock_audio = true;

		if (NDIlib_initialize())
		{
           CUtil::log(properties, "created sender globally");
           sender NDIlib_send_create(&descriptor);
		}
		return sender ;
	}


};

#endif // CNDI_H
