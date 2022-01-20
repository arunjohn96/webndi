#ifndef CCHANNELMANAGER_H
#define CCHANNELMANAGER_H

#include <napi.h>
#include <map>
#include "sendaudio.h"
#include "receiveaudio.h"

class CChannelManager
{
public:
    static void ListChannel(Properties& properties, const Napi::CallbackInfo& info);
    static void DeleteChannel(Properties& properties);
    static void ChannelControl(Properties& properties);
};

#endif // CCHANNELMANAGER_H
