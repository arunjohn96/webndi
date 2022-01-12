#ifndef CRECEIVEAUDIO_H
#define CRECEIVEAUDIO_H

#include <cstring>

#include <Processing.NDI.Lib.h>
#include <Processing.NDI.Recv.h>
#include <Processing.NDI.Lib.cplusplus.h>

#include "napi.h"
#include "channel.h"
#include "ndi.h"
#include <iostream>
#include <stdio.h>

using namespace std;

class CReceiveAudio : public CStream
{
public:
    CReceiveAudio();
    ~CReceiveAudio();
    CReceiveAudio(Properties& properties);

    std::string id();
    int command(Properties& properties);
    int execute(uint8_t*& buffer, size_t& bsize);

private:
    NDIlib_recv_instance_t      m_receiver;
    std::string                 m_id;
    std::string                 m_channel_name;
    Command                     m_command;
    int                         m_channel_search_max_wait_time;
    double                      m_interval;
};

#endif // CRECEIVEAUDIO_H

