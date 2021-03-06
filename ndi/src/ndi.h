#ifndef CNDI_H
#define CNDI_H

#include "util.h"
#include <iostream>
#include <algorithm>
#include <vector>
#include <iterator>

class CNdi
{
    public:

    static map<string, NDIlib_send_instance_t> lst_sender;
    static map<string, NDIlib_recv_instance_t> lst_receiver;

    static std::vector<std::string> GetAllSourceNames(std::string channel_group="", std::string ips="", int max_wait_time=60, int max_search_trials=5)
    {
        std::vector<std::string> v_sources;

        if (NDIlib_initialize())
        {
            const NDIlib_find_create_t finder_desc = {
                true,
                ((channel_group.empty())?NULL:channel_group.c_str()),
                ((ips.empty())?NULL:ips.c_str())
            };
            NDIlib_find_instance_t p_finder = NDIlib_find_create_v2(&finder_desc);

            int search_trials = 0;
            uint32_t no_of_sources = 0;
            int wait_time = 0;
            const NDIlib_source_t* p_sources;
            while(wait_time < max_wait_time)
      			{
      				wait_time++;
      				NDIlib_find_wait_for_sources(p_finder, max_wait_time/* 1 second */);
      				p_sources = NDIlib_find_get_current_sources(p_finder, &no_of_sources);
      				for(uint32_t index=0; index<no_of_sources; index++)
      				{
      					v_sources.push_back(p_sources[index].p_ndi_name) ;
      				}
      			}
            /*
            while(search_trials < max_search_trials)
            {
                search_trials++;

                const NDIlib_source_t* p_sources = GetAllSources(p_finder, no_of_sources, max_wait_time);


                if (p_sources)
                {
                  for(uint32_t index=0; index<no_of_sources; index++)
                  {
                      std::string channel_name = p_sources[index].p_ndi_name ;
                      CUtil::log("NDI sources ... "+ channel_name );

                      if (!channel_name.empty() && std::find(v_sources.begin(), v_sources.end(), channel_name) == v_sources.end())
                      {
                        v_sources.push_back(channel_name);
                      }
                    }
                }
            }*/

            NDIlib_find_destroy(p_finder);
        }
        return v_sources ;
    }

    static NDIlib_recv_instance_t CreateReceiver(std::string channel_name, std::string channel_group="", std::string ips="", int max_wait_time=60, std::string bandwith="low")
    {
        NDIlib_recv_instance_t p_receiver = NULL;
        std::string source_name = ((channel_group.empty())?"-":channel_group) + "-" + channel_name;
        map<string, NDIlib_recv_instance_t>::const_iterator it = lst_receiver.find(source_name);
        if (it != lst_receiver.end())
        {
            return it->second ;
        }

        if (NDIlib_initialize())
        {
            // const NDIlib_find_create_t finder_desc = { true, channel_group.c_str(), ips.c_str() };
            const NDIlib_find_create_t finder_desc = {
                true,
                ((channel_group.empty())?NULL:channel_group.c_str()),
                ((ips.empty())?NULL:ips.c_str())
            };
            NDIlib_find_instance_t p_finder = NDIlib_find_create_v2(&finder_desc);
            if(!p_finder) return NULL ;

            int wait_time = 0;
            uint32_t no_of_sources = 0;
            const NDIlib_source_t* p_source = NULL;
            const NDIlib_source_t* p_sources = NULL;

            CUtil::log("Serching for all NDI sources ...");
            while(!p_source && wait_time < max_wait_time)
            {
                wait_time++;
                NDIlib_find_wait_for_sources(p_finder, 1000/* 1 second */);
                p_sources = NDIlib_find_get_current_sources(p_finder, &no_of_sources);
                if (p_sources)
                 {
                  for(uint32_t index=0; index<no_of_sources; index++)
                  {
                    std::string ndi_source_name = p_sources[index].p_ndi_name ;
                    CUtil::log(" index:" + std::to_string(index) + " name:" + ndi_source_name);
                    if(ndi_source_name.find("("+channel_name+")")!=std::string::npos)
                    {
                      p_source = &p_sources[index];
                      break;
                    }
                  }
                }
            }

            if(!p_source) return NULL;

            NDIlib_recv_create_v3_t receiver_desc;
            receiver_desc.source_to_connect_to = *p_source;
            receiver_desc.color_format = NDIlib_recv_color_format_RGBX_RGBA ;
            receiver_desc.bandwidth = (!bandwith.compare("low") ? NDIlib_recv_bandwidth_lowest : NDIlib_recv_bandwidth_highest);
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

    static NDIlib_send_instance_t CreateSender(std::string channel_name, std::string channel_group="")
    {
        NDIlib_send_instance_t p_sender = NULL ;

        std::string source_name = ((channel_group.empty())?"-":channel_group) + "-" + channel_name;
        map<string, NDIlib_send_instance_t>::const_iterator it = lst_sender.find(source_name);
        if (it != lst_sender.end())
        {
            CUtil::log("sender '" + channel_name  + "' of group '"+ channel_group + "' already created globally");
            return it->second ;
        }

        if (NDIlib_initialize())
        {
            NDIlib_send_create_t send_desc;
            send_desc.p_ndi_name = channel_name.c_str();
            if(!channel_group.empty()) {
                send_desc.p_groups = channel_group.c_str();
            }
            send_desc.clock_audio = true;
            CUtil::log("created new sender '" + channel_name  + "' of group '"+ channel_group + "' globally");
            p_sender = NDIlib_send_create(&send_desc);
            lst_sender[source_name] = p_sender;
        }
        return p_sender ;
    }

    static const char * GetVideoType(NDIlib_FourCC_video_type_e type)
    {
        switch(type)
        {
            case NDIlib_FourCC_video_type_UYVY :
                return "NDIlib_FourCC_video_type_UYVY";
            case NDIlib_FourCC_video_type_UYVA :
                return "NDIlib_FourCC_video_type_UYVA";
            case NDIlib_FourCC_video_type_P216 :
                return "NDIlib_FourCC_video_type_P216";
            case NDIlib_FourCC_video_type_PA16 :
                return "NDIlib_FourCC_video_type_PA16";
            case NDIlib_FourCC_video_type_YV12 :
                return "NDIlib_FourCC_video_type_YV12";
            case NDIlib_FourCC_video_type_I420 :
                return "NDIlib_FourCC_video_type_I420";
            case NDIlib_FourCC_video_type_NV12 :
                return "NDIlib_FourCC_video_type_NV12";
            case NDIlib_FourCC_video_type_BGRA :
                return "NDIlib_FourCC_video_type_BGRA";
            case NDIlib_FourCC_type_BGRX :
                return "NDIlib_FourCC_type_BGRX";
            case NDIlib_FourCC_video_type_RGBA :
                return "NDIlib_FourCC_video_type_RGBA";
            case NDIlib_FourCC_video_type_RGBX :
                return "NDIlib_FourCC_video_type_RGBX";
            default:
                return "Unknown";
        }
    }

    private:

    static const NDIlib_source_t* GetAllSources(NDIlib_find_instance_t p_finder, uint32_t& no_of_sources, int wait_time)
    {
        const NDIlib_source_t* p_sources = NULL;
        // CUtil::log("Serching for all NDI sources ... Wait Time :::"+ wait_time +"::::"+ no_of_sources);
        std::cout << "Serching for all NDI sources ... Wait Time :::"<< wait_time <<"::::"<< no_of_sources << '\n';

        while(p_finder && !no_of_sources && wait_time)
        {
            NDIlib_find_wait_for_sources(p_finder, wait_time/* 1 second */);
            p_sources = NDIlib_find_get_current_sources(p_finder, &no_of_sources);
            wait_time-- ;
        }
        return p_sources ;
    }
};

#endif // CNDI_H
