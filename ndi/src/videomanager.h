#ifndef CVIDEOMANAGER_H
#define CVIDEOMANAGER_H

#include <napi.h>
#include <map>
#include "sendvideo.h"
#include "receivevideo.h"
#include "asyncmanager.h"

class CVideoManager
{
public:
    static void CreateSendChannel(Properties& properties);
    static void CreateReceiveChannel(Properties& properties);
    static void SendVideo(Properties& properties, const Napi::CallbackInfo& info);
    static void ReceiveVideo(Properties& properties, const Napi::CallbackInfo& info);
};

#endif // CVIDEOMANAGER_H
