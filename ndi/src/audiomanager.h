#ifndef CAUDIOMANAGER_H
#define CAUDIOMANAGER_H

#include <napi.h>
#include <map>
#include "sendaudio.h"
#include "receiveaudio.h"
#include "asyncmanager.h"

class CAudioManager
{
public:
    static void CreateSendChannel(Properties& properties);
    static void CreateReceiveChannel(Properties& properties);
    static void DeleteChannel(Properties& properties);
	static void ChannelControl(Properties& properties);
	static void SendAudio(Properties& properties, const Napi::CallbackInfo& info);
	static void ReceiveAudio(Properties& properties, const Napi::CallbackInfo& info);
};

#endif // CAUDIOMANAGER_H
