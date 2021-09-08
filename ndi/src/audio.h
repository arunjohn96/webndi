#ifndef CAUDIO_H
#define CAUDIO_H

#include <cstring>

#include <Processing.NDI.Lib.h>
#include <Processing.NDI.Send.h>
#include <Processing.NDI.Lib.cplusplus.h>

#include "stream.h"
#include <iostream>

using namespace std;

typedef std::map<std::string, std::string>Properties;

class CAudio : public CStream
{
public:
    CAudio(Properties& properties);
    virtual int send(uint8_t* buffer, size_t bsize); 
private:
    CAudio();
    virtual ~CAudio();
    std::string GetProperty(Properties& properties, std::string key); 

    NDIlib_send_instance_t m_sender;
    std::string            m_channel_name ;
    int                    m_sample_rate ;
    int                    m_no_of_channels ;
    int                    m_no_of_samples ;
    long                   m_channel_stride ;
};

#endif // CAUDIO_H

