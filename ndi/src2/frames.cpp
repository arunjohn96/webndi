#include "frames.h"

CFrames::CFrames(Napi::Object& properties, Napi::ArrayBuffer& frames)
{
    bsize = frames.ByteLength() / sizeof(uint8_t);
    buffer = reinterpret_cast<uint8_t*>(frames.Data());

    id = properties.Get("id").ToString() ;
    type = properties.Get("key").ToString() ; 

    Napi::Array keys = properties.GetPropertyNames();

    for(size_t index=0; index < keys.Length(); index++) 
    {
        std::string key = (static_cast<Napi::Value>(keys[index])).ToString() ;
        std::string value = properties.Get(key).ToString() ;
        m_properties[key]  = value ;
    }
}

CFrames::~CFrames()
{
    m_properties.clear() ;
    if(buffer) free(buffer) ;
}

std::string CFrames::GetId()
{
    return id ; 
}

std::string CFrames::GetType()
{
    return type ; 
}

void CFrames::Send()
{
    if (bsize>0) 
    {
        CChannel* channel = CChannel::book(m_properties) ;
        if(channel) {
            channel->stream()->send(buffer, bsize) ;
        }
    }
}
