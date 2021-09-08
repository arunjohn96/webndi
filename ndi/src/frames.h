#ifndef CFRAMES_H
#define CFRAMES_H

#include <napi.h>
#include <map>
#include "channel.h"

class CFrames
{
public:
    CFrames();
    CFrames(Napi::Object& properties, Napi::ArrayBuffer& frames) ;
    ~CFrames();
    std::string GetId();
    std::string GetType();
    void Send();

private:
    std::string                         id;
    size_t                              bsize;
    uint8_t*                            buffer;
    std::string                         type;
    std::map<std::string,std::string>   m_properties;
};

#endif // CFRAMES_H
