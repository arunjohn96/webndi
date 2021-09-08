#ifndef CVIDEO_H
#define CVIDEO_H

#include <cstring>

#include <Processing.NDI.Lib.h>
#include <Processing.NDI.Send.h>
#include <Processing.NDI.Lib.cplusplus.h>

#include "stream.h"
#include <iostream>

using namespace std;

typedef std::map<std::string, std::string>Properties;

class CVideo : public CStream
{
public:
    CVideo(Properties& properties);
    virtual int send(uint8_t* buffer, size_t bsize); 
private:
    CVideo();
    virtual ~CVideo();
    std::string GetProperty(Properties& properties, std::string key); 

    NDIlib_send_instance_t m_sender;
    std::string            m_channel_name ;
    int                    m_xres ;
    int                    m_yres ;
    int                    m_framerate ;
    long                   m_channel_stride ;
};

#endif // CVIDEO_H

