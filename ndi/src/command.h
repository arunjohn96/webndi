#ifndef COMMAND_H
#define COMMAND_H

#include <map>

enum StreamType {
    AUDIO,
    VIDEO
};

enum Command {
    InvalidCommand,                          //  0
    ListChannel,                             //  1
    ChannelControl,                          //  2
    CreateSendAudioChannel,                  //  3
    CreateReceiveAudioChannel,               //  4
    DeleteAudioChannel,
    SendAudio,
    ReceiveAudio,
    CreateSendVideoChannel,
    CreateReceiveVideoChannel,               //  9
    DeleteVideoChannel,
    SendVideo,
    ReceiveVideo,
    Start,
    Stop,                                    // 13
    Sleep
};

static const std::map<std::string, Command> Commands 
{
    { "list-channel", ListChannel },
    { "channel-control", ChannelControl},
    { "create-send-audio-channel", CreateSendAudioChannel },
    { "create-receive-audio-channel", CreateReceiveAudioChannel },
    { "delete-audio-channel", DeleteAudioChannel },
    { "send-audio", SendAudio },
    { "receive-audio", ReceiveAudio},
    { "create-send-video-channel", CreateSendVideoChannel },
    { "create-receive-video-channel", CreateReceiveVideoChannel },
    { "delete-video-channel", DeleteVideoChannel },
    { "send-video", SendVideo},
    { "receive-video", ReceiveVideo},
    { "start", Start},
    { "stop", Stop},
    { "sleep", Sleep}
};

#endif // COMMAND_H
