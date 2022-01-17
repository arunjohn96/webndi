#ifndef CASYNCMANAGER_H
#define CASYNCMANAGER_H

#include <thread>
#include "receiveaudio.h"
#include "receivevideo.h"

using namespace Napi;

class CAsyncManager : public AsyncProgressQueueWorker<uint8_t> {
    public:
        CAsyncManager(StreamType type, CChannel* channel, Function& logger, Function& updator)
        : AsyncProgressQueueWorker(logger) {
			m_channel = channel;
            m_updator.Reset(updator, 1);
        }

        ~CAsyncManager() {}
        
        void Execute(const ExecutionProgress& progress) {
			while(!m_channel->stream()->stop())
			{
				size_t bsize = 0;
				uint8_t* buffer = nullptr;
				m_channel->stream()->execute(buffer, bsize);
				if(bsize>0) { 
					progress.Send((const uint8_t*)buffer, (size_t)bsize);
			        free(buffer);
				}
			}
        }

        void OnOK() 
		{
            HandleScope scope(Env());
            Callback().Call({String::New(Env(), "Processing Completed!")});
        }
        
        void OnError(const Error &e) 
		{
            HandleScope scope(Env());
            Callback().Call({String::New(Env(), e.Message())});
        }

		void OnProgress(const uint8_t* data, size_t bsize)
		{
            HandleScope scope(Env());
			Object result = Object::New(Env());
			result.Set("channelName", Napi::String::New(Env(), m_channel->stream()->name())); 
			result.Set("channelId", Napi::String::New(Env(), m_channel->stream()->id()));
 			result.Set("data", ArrayBuffer::New(Env(), (void*)data, bsize));
            if (!m_updator.IsEmpty()) {
				m_updator.Call(Receiver().Value(), {result}); // working ?
            }
        }

    private:
        FunctionReference m_updator;
		CChannel*         m_channel;
};

#endif // CASYNCMANAGER_H 
