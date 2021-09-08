#ifndef CSTREAM_H
#define CSTREAM_H

#include <map>

class CStream
{
public:
    virtual int send(uint8_t* buffer, size_t bsize) = 0; 
    virtual ~CStream() = 0;
};

#endif // CSTREAM_H
