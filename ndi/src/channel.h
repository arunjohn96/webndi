#ifndef CCHANNEL_H
#define CCHANNEL_H

#include <iostream>
#include <iterator>
#include <map>
#include "audio.h"
#include "video.h"

using namespace std;

typedef std::map<std::string, std::string>Properties;

class CChannel
{
private:
    CChannel() {m_sender = nullptr;}
    CChannel(const CChannel&) {}
    CChannel& operator = (const CChannel&) { return *this; }
    static map<string, CChannel*> list;
public:
    
    static CChannel* GetChannel(string id)
    {
        typename map<string, CChannel*>::const_iterator it = list.find(id) ;
        return ((it != list.end())?((CChannel*)(it->second)):nullptr) ;
    }

    static void SetChannel(CChannel* channel, Properties& properties)
    {
        channel->m_properties.clear() ;
        if (channel->m_sender) delete channel->m_sender ;

        channel->m_properties = properties; 

        if (properties.find("type")->second == "audio")
            channel->m_sender = new CAudio(properties);
        else
            channel->m_sender = new CVideo(properties);
    }

    static void ResetChannel(string id, Properties& properties)
    {
        CChannel* channel = GetChannel(id) ;
        if(channel) { SetChannel(channel, properties); }
    }

    static void destroy()
    {
        typename map<string, CChannel*>::const_iterator it = list.begin() ;
        for(;it != list.end(); ++it) { delete (*it).second; }
        list.clear();
    }
    static CChannel* book(Properties& properties)
    {
        Properties::const_iterator it = properties.find("id") ;
        string id = it->second ;

        CChannel* channel = GetChannel(id) ;
        if(!channel) 
        {
            channel = new CChannel();
            if(channel) {
                SetChannel(channel, properties);
                list[id] = channel;
            }
        }
        return channel;
    }
    static void kick(string id)
    {
        CChannel* channel = GetChannel(id) ;
        if (channel) 
        {  
            channel->m_properties.clear() ;
            if (channel->m_sender) delete channel->m_sender ;
            delete channel ;  
            list.erase(id); 
        }
    }

    CStream * stream()
    {
        return m_sender ;
    }
protected:
    CStream* m_sender;
    std::map<std::string,std::string> m_properties;
    ~CChannel() {}
};

//map<string, CChannel*> CChannel::list ; 

#endif // CCHANNEL_H

