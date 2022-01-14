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
	virtual int command(Properties& properties)=0;
    virtual int execute(uint8_t*& buffer, size_t& bsize)=0;

	std::string Mode() { return mode; }
	std::string Type() { return type; }
	void SetModeAndType(std::string _mode,std::string _type) { mode=_mode; type=_type; }
private:
	std::string mode;
	std::string type;
};

#endif // CSTREAM_H
