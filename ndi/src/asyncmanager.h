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
			this->type = type;
			this->channel = channel;
            this->updator.Reset(updator, 1);
        }

        ~CAsyncManager() {}
        
        void Execute(const ExecutionProgress& progress) {
			while(true)
			{
				size_t bsize = 0;
				uint8_t* buffer = nullptr;
				this->channel->stream()->execute(buffer, bsize);
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
            if (!this->updator.IsEmpty()) {
				 this->updator.Call(Receiver().Value(), {ArrayBuffer::New(Env(), (void*)data, bsize)} );
            }
        }

    private:
        FunctionReference updator;
		CChannel* channel;
		StreamType type;
};

#endif // CASYNCMANAGER_H 
