import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useBlogContext } from "../fetchdata/BlogContext";
import messageAlertSound from "../assets/audio/message.mp3";
import axiosInstance from "../axiosInstance";
import getDecryptData from "../helper/getDecryptData";

const ChatDriver = () => {
  const { sendMessage, AllMessages } = useBlogContext();

  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const { senderId, bookid } = useParams();

  const decryptdatajson = getDecryptData();
  const userId = decryptdatajson._id;
  const [audio] = useState(new Audio(messageAlertSound)); // Create an Audio object with the sound file
  const [messagesData, setMessagesData] = useState([]);

  const [SenderName, setSenderName] = useState(null);
  const [Loading, setLoading] = useState(true);

  useEffect(() => {
    //form handle
    const fetchUsernameById = async () => {
      try {
        const response = await axiosInstance.get(`/get-username/${senderId}`);
        const { user, success } = response.data;
        if (success) {
          console.log(response);
          setSenderName(user?.username);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    const fetchUserById = async () => {
      try {
        const response = await axiosInstance.get(
          `/get-message-orderid/${userId}/${senderId}/${bookid}`
        );
        const { messages, success } = response.data;
        if (success) {
          console.log(messages);
          setMessagesData(messages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoading(false);
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }
    };

    fetchUserById();
    fetchUsernameById();
  }, []);

  useEffect(() => {
    setMessages(AllMessages);
    scrollToBottom(); // Scroll to the bottom of the chat box whenever messages are updated

    console.log(AllMessages);
  }, [AllMessages]);

  const handleMessageSubmit = async (e) => {
    e.preventDefault();
    const sendmsg = {
      text: messageInput,
      userId: userId,
      senderId: senderId,
      orderId: bookid,
      type: "message",
    };
    sendMessage(sendmsg);
    // socket.emit('chat message', { text: messageInput, userId:userId,senderId:senderId });
    setMessageInput("");
    scrollToBottom(); // Scroll to the bottom of the chat box whenever messages are updated

    try {
      const { data } = await axiosInstance.post(`/add-message-orderid`, {
        text: messageInput,
        userId: userId,
        senderId: senderId,
        orderId: bookid,
      });
      const { success } = data;
      console.log("data data", data);
      if (success) {
        toast.success("message Send Sucessfully");
      }
    } catch (error) {
      console.error("Error On Profile:", error);
      console.log(formData);
      toast.error(error.response.data.message);
    }
  };

  const playMessageAlert = () => {
    const audio = new Audio(messageAlertSound);
    audio.play();
  };

  const scrollToBottom = () => {
    const scrollOffset = 1600000; // Adjust the scroll offset as needed
    window.scrollTo({
      top: document.body.scrollHeight + scrollOffset,
      behavior: "smooth",
    }); // Scroll to the bottom of the page with an additional offset
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const options = {
      month: "long", // Use 'long' to display the full month name
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: true,
    };
    return date.toLocaleString("en-US", options);
  };
  return (
    <>
      <header className="header header-fixed">
        <div className="header-content">
          <div className="left-content">
            <Link to="/driver/rides" className="back-btn">
              <i className="ri-arrow-left-line"></i>
            </Link>
          </div>
          <div className="mid-content">
            <h4 className="title">
              {Loading ? (
                <div
                  className="skeleton m-auto"
                  style={{ height: 35, width: 150 }}
                />
              ) : (
                <>{SenderName ? SenderName : "Anonymous User"}</>
              )}
            </h4>
          </div>
          <div className="right-content d-flex align-items-center gap-4"></div>
        </div>
      </header>

      <main className="page-content space-top p-b60 ">
        <div className="container">
          <div className="chat-box-area">
            {Loading ? (
              <>
                <div className="chat-content">
                  <div
                    className="skeleton"
                    style={{ height: 40, width: 150 }}
                  />
                </div>
                <div className="chat-content user">
                  <div
                    className="skeleton"
                    style={{ height: 40, width: 150 }}
                  />
                </div>
                <div className="chat-content">
                  <div
                    className="skeleton"
                    style={{ height: 40, width: 150 }}
                  />
                </div>
                <div className="chat-content user">
                  <div
                    className="skeleton"
                    style={{ height: 40, width: 150 }}
                  />
                </div>
                <div className="chat-content">
                  <div
                    className="skeleton"
                    style={{ height: 40, width: 150 }}
                  />
                </div>
                <div className="chat-content user">
                  <div
                    className="skeleton"
                    style={{ height: 40, width: 150 }}
                  />
                </div>
                <div className="chat-content">
                  <div
                    className="skeleton"
                    style={{ height: 40, width: 150 }}
                  />
                </div>
                <div className="chat-content user">
                  <div
                    className="skeleton"
                    style={{ height: 40, width: 150 }}
                  />
                </div>

                <div className="chat-content">
                  <div
                    className="skeleton"
                    style={{ height: 40, width: 150 }}
                  />
                </div>
                <div className="chat-content user">
                  <div
                    className="skeleton"
                    style={{ height: 40, width: 150 }}
                  />
                </div>
                <div className="chat-content">
                  <div
                    className="skeleton"
                    style={{ height: 40, width: 150 }}
                  />
                </div>
                <div className="chat-content user">
                  <div
                    className="skeleton"
                    style={{ height: 40, width: 150 }}
                  />
                </div>
              </>
            ) : (
              messagesData.map((message, index) => (
                <div
                  key={index}
                  className={`chat-content  ${
                    message.receiver === userId ? "user" : ""
                  }`}
                >
                  <div className="message-item">
                    <div className="bubble">{message.text}</div>
                    <div className="message-time">
                      {formatTimestamp(message.createdAt)}
                    </div>
                  </div>
                </div>
              ))
            )}
            {messages.map(
              (message, index) =>
                message.orderId === bookid && (
                  <div
                    key={index}
                    className={`chat-content ${
                      message.userId === userId ? "user" : ""
                    }`}
                  >
                    <div className="message-item">
                      <div className="bubble">{message.text}</div>
                      <div className="message-time">{message.time}</div>
                    </div>
                  </div>
                )
            )}
          </div>
        </div>
      </main>

      <div className="chat-footer">
        <form onSubmit={handleMessageSubmit}>
          <div className="form-group boxed">
            <div className="input-wrapper message-area input-lg">
              <div className="append-media" />
              <input
                type="text"
                className="form-control"
                placeholder="Type Something"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <button type="submit" className="btn chat-btn">
                <i className="ri-send-plane-2-fill py-2 text-primary"></i>
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default ChatDriver;
