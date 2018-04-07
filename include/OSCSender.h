/***** OSCSender.h *****/
#ifndef __OSCSender_H_INCLUDED__
#define __OSCSender_H_INCLUDED__ 

#include <UdpClient.h>
#include <oscpkt.hh>
#include <AuxTaskNonRT.h>

#define OSCSENDER_DEFAULT_STREAMING_BUFFERSIZE 1024

/**
 * \brief OSCSender provides functions for sending OSC messages from Bela.
 *
 * Functionality is provided for sending messages with int, float, bool, 
 * std::string and binary blob arguments. Sending a stream of floats is
 * also supported.
 *
 * Uses oscpkt (http://gruntthepeon.free.fr/oscpkt/) underneath
 */
class OSCSender{
	public:
		OSCSender();
		
        /**
		 * \brief Initialises OSCSender
		 *
		 * Must be called once during setup()
		 *
		 * If address is left blank it will default to localhost (127.0.0.1)
		 *
		 * @param port the UDP port number used to send OSC messages
		 * @param address the IP address OSC messages are sent to (defaults to 127.0.0.1)
		 *
		 */
		void setup(int port, std::string ip_address=std::string("127.0.0.1"));
		
		/**
		 * \brief Creates a new OSC message
		 *
		 * @param address the address which the OSC message will be sent to
		 *
		 */
		OSCSender &newMessage(std::string address);
		/**
		 * \brief Adds an int argument to a message
		 *
		 * Can optionally be chained with other calls to add(), newMessage() and
		 * send() or sendNow()
		 *
		 * @param payload the argument to be added to the message
		 */
		OSCSender &add(int payload);
		/**
		 * \brief Adds a float argument to a message
		 *
		 * Can optionally be chained with other calls to add(), newMessage() and
		 * send() or sendNow()
		 *
		 * @param payload the argument to be added to the message
		 */
		OSCSender &add(float payload);
		/**
		 * \brief Adds a string argument to a message
		 *
		 * Can optionally be chained with other calls to add(), newMessage() and
		 * send() or sendNow()
		 *
		 * @param payload the argument to be added to the message
		 */
		OSCSender &add(std::string payload);
		/**
		 * \brief Adds a boolean argument to a message
		 *
		 * Can optionally be chained with other calls to add(), newMessage() and
		 * send() or sendNow()
		 *
		 * @param payload the argument to be added to the message
		 */
		OSCSender &add(bool payload);
		/**
		 * \brief Adds a binary blob argument to a message
		 *
		 * Copies binary data into a buffer, which is sent as a binary blob.
		 * Can optionally be chained with other calls to add(), newMessage() and
		 * send() or sendNow()
		 *
		 * @param ptr pointer to the data to be sent
		 * @param num_bytes the number of bytes to be sent
		 */
		OSCSender &add(void *ptr, size_t num_bytes);
		/**
		 * \brief Sends the message
		 *
		 * After creating a message with newMessage() and adding arguments to it
		 * with add(), the message is sent with this function. It is safe to call
		 * from the audio thread.
		 *
		 */
		void send();
		/**
		 * \brief Blocks execution until message is sent
		 *
		 * As an alternative to send(), sendNow() blocks until the message is sent
		 * and should only be used from setup() or a seperate thread.
		 *
		 */
		void sendNow();
		
		/**
		 * \brief Sets the address and buffer size when streaming
		 *
		 * Must be called once during setup() to prepare OSCSender for streaming
		 *
		 * @param address the OSC address which data will be steamed to
		 * @param streaming_buffer_size the buffer size used when streaming data. Defaults to 1024
		 *
		 */
		void streamTo(std::string address, int streaming_buffer_size = OSCSENDER_DEFAULT_STREAMING_BUFFERSIZE);
		/**
		 * \brief Streams data to the address set in streamTo()
		 *
		 * Data passed to this function is added to an internal buffer which is
		 * sent as a binary blob when the buffer is full
		 *
		 * @param in data to be streamed
		 *
		 */
		void stream(float in);
		// void stream(float* buf, int num_floats);

	private:
		std::string ip_address;
        	int port;
        
        	UdpClient socket;
        
        	oscpkt::Message msg;
        	oscpkt::PacketWriter pw;

        	AuxTaskNonRT send_task;
        	static void send_task_func(void* ptr, void* buf, int size);
        
        	std::string streamAddress;
        	std::vector<float> streamBuffer;
        	int streamBufferSize;
        
        	AuxTaskNonRT stream_task;
        	static void stream_task_func(void* ptr, void* buf, int size);
};

#endif