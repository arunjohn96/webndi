#ifndef CSTREAM_H
#define CSTREAM_H

#include <napi.h>
#include <map>
#include "util.h"

class CStream
{
public:
    virtual ~CStream() {};
    virtual std::string id() = 0;
	virtual int command(Properties& properties)=0;
    virtual int execute(uint8_t*& buffer, size_t& bsize)=0;
};

#endif // CSTREAM_H
