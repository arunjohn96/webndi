#ifndef CRECEIVEVIDEO_H
#define CRECEIVEVIDEO_H

#include <cstring>

#include <Processing.NDI.Lib.h>
#include <Processing.NDI.Recv.h>
#include <Processing.NDI.Lib.cplusplus.h>

#include "channel.h"
#include "ndi.h"
#include <iostream>

using namespace std;

class CReceiveVideo : public CStream
{
public:
    CReceiveVideo();
    ~CReceiveVideo();
    CReceiveVideo(Properties& properties);

    std::string id();
    std::string name();
    std::string group();
    int execute(uint8_t*& buffer, size_t& bsize);

private:
    NDIlib_recv_instance_t      m_receiver;
    std::string                 m_id;
    std::string                 m_channel_name;
    std::string                 m_channel_group;
    std::string                 m_channel_ips;
    int                         m_channel_search_max_wait_time;
    double                      m_interval;
    std::string                 m_bandwidth;
};

#endif // CRECEIVEVIDEO_H
