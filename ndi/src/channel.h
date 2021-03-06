#ifndef CCHANNEL_H
#define CCHANNEL_H

#include <iostream>
#include <iterator>
#include <map>
#include "stream.h"

using namespace std;

class CChannel
{
private:
    CChannel() {m_stream = nullptr;}
    CChannel(const CChannel&) {}
    CChannel& operator = (const CChannel&) { return *this; }
    static map<string, CChannel*> list;
public:

    static CChannel* get(string id)
    {
        typename map<string, CChannel*>::const_iterator it = list.find(id);
        return ((it != list.end())?((CChannel*)(it->second)):nullptr);
    }

    static void destroy()
    {
        typename map<string, CChannel*>::const_iterator it = list.begin();
        for(;it != list.end(); ++it) { delete (*it).second; }
        list.clear();
    }

    static CChannel* book(CStream* stream)
    {
        CChannel* channel = nullptr;
        if(stream)
        {
            CChannel* channel = get(stream->id());
            if(!channel)
            {
                status("booking new", stream) ;
                channel = new CChannel();
                channel->m_stream = stream;
                list[stream->id()] = channel;
                status("successfully booked", stream);
            }
            else
            {
                status("already booked", stream);
            }
        }
        return channel;
    }

    static void kick(string id)
    {
        CChannel* channel = get(id);
        if (channel)
        {
            status("kicking out channel ", id);
            if (channel->m_stream) delete channel->m_stream;
            status("before delete ", id);
            delete channel;
            status("before erase ", id);
            list.erase(id);
            status("after kicking out channel ", id);
        }
    }

    static void status(std::string msg, CStream* stream)
    {
        std::cout<<msg<<" "<<stream->Type()<<" "<<stream->Mode()<<" "<<stream->id()<<std::endl;
    }

    static void status(std::string msg, std::string id)
    {
        std::cout<<msg<<id<<std::endl;
    }

    CStream * stream()
    {
        return m_stream;
    }

protected:
    CStream* m_stream;
    ~CChannel() {}
};

//map<string, CChannel*> CChannel::list;

#endif // CCHANNEL_H
