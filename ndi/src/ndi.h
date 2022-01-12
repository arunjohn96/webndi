#ifndef CNDI_H
#define CNDI_H

#include "util.h"
#include <iostream>

#include <iterator>

class CNdi
{
	public:

	static map<string, NDIlib_send_instance_t> lst_sender;
	static map<string, NDIlib_recv_instance_t> lst_receiver;

	static NDIlib_recv_instance_t CreateReceiver(std::string source_name, int max_wait_time=60)
	{
		NDIlib_recv_instance_t p_receiver = NULL;
        map<string, NDIlib_recv_instance_t>::const_iterator it = lst_receiver.find(source_name);
		if (it != lst_receiver.end())
		{
			return it->second ;
		}

		if (NDIlib_initialize())
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

			NDIlib_recv_create_v3_t receiver_desc;
			receiver_desc.source_to_connect_to = *p_source;
			receiver_desc.color_format = NDIlib_recv_color_format_RGBX_RGBA ;
			receiver_desc.bandwidth = NDIlib_recv_bandwidth_highest;
			receiver_desc.allow_video_fields = true;
			receiver_desc.p_ndi_recv_name = NULL;

		    p_receiver =  NDIlib_recv_create_v3(&receiver_desc);
			if (p_receiver)
			{
				NDIlib_recv_connect(p_receiver, p_source) ;
				NDIlib_find_destroy(p_finder);
				lst_receiver[source_name] = p_receiver;   
			}
		}
		return p_receiver ;
	}

	static NDIlib_send_instance_t CreateSender(std::string source_name)
	{
        NDIlib_send_instance_t p_sender = NULL ;

        map<string, NDIlib_send_instance_t>::const_iterator it = lst_sender.find(source_name);
		if (it != lst_sender.end())
		{
			CUtil::log("sender '" + source_name  + "' already created globally");
			return it->second ;
		}

		if (NDIlib_initialize())
		{
			NDIlib_send_create_t descriptor;
			descriptor.p_ndi_name = source_name.c_str();
			descriptor.clock_audio = true;
			CUtil::log("created new sender '" + source_name  + "' globally");
			p_sender = NDIlib_send_create(&descriptor);
			lst_sender[source_name] = p_sender;   
		}
		return p_sender ;
	}
	  
};

#endif // CNDI_H
