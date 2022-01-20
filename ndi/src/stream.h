#ifndef CSTREAM_H
#define CSTREAM_H

#include <napi.h>
#include <map>
#include "util.h"

class CStream
{
public:
    CStream(){};
    virtual ~CStream() {};
    virtual std::string id() = 0;
    virtual std::string name() = 0;
    virtual std::string group() = 0;
    virtual int execute(uint8_t*& buffer, size_t& bsize)=0;

    std::string Mode() { return m_mode; }
    std::string Type() { return m_type; }
    void SetModeAndType(std::string mode,std::string type) { m_mode=mode; m_type=type; }
    void command(Properties& properties) { m_command=CUtil::GetCommand(properties); }
    bool stop() { return (m_command == Stop); }  

private:
    std::string m_mode;
    std::string m_type;
    Command m_command;
};

#endif // CSTREAM_H
