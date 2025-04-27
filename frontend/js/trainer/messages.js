export function initTrainer_messages() {

        // DOM Elements
        const messagesList = document.getElementById('messages-list');
        const chatMessages = document.getElementById('chat-messages');
        const chatHeader = document.getElementById('chat-header');
        const chatInputArea = document.getElementById('chat-input-area');
        const messageInput = document.getElementById('message-input');
        const sendMessageBtn = document.getElementById('send-message-btn');
        const newMessageBtn = document.getElementById('new-message-btn');
        const newMessagePopup = document.getElementById('new-message-popup');
        const recipientSelect = document.getElementById('recipient-select');
        const newMessageText = document.getElementById('new-message-text');
        const submitNewMessageBtn = document.getElementById('submit-new-message');
        const cancelNewMessageBtn = document.getElementById('cancel-new-message');
        const spinner = document.getElementById("loading-spinner");
        const toastContainer = document.getElementById('toast-container');


        
        // State variables
        let currentUserId; // Will be set after fetching user data
        let currentRecipientId = null;
        let messageThreads = [];
        let allUsers = [];
        
        // Initialize the page
        init();
        
        async function init() {
            showLoading();
            try {
                const userData = await fetchCurrentUser();
                if (!userData || !userData.data || !userData.data.rollID) {
                    throw new Error('Invalid user data received');
                }
                currentUserId = userData.data.rollID;
                console.log('Current user ID:', currentUserId);
                
                // Load message threads and users sequentially to better handle errors
                await loadMessageThreads();
                await loadAllUsers();
                
            } catch (error) {
                console.error('Initialization error:', error);
                showToast('Failed to load messages', 'error');
            } finally {
                // This will always run, ensuring spinner is hidden
                hideLoading();
            }
        }
        
        async function fetchCurrentUser() {
          // This should be replaced with your actual user fetching logic
          // For example, you might have an endpoint that returns the logged-in user's data
          const response = await fetch('http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=get_profile', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          
          return await response.json();
        }
        
        async function loadMessageThreads() {
            try {
                showLoading();
                const response = await fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=get_threads&userId=${currentUserId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to load message threads');
                }
                
                messageThreads = await response.json();
                renderMessageThreads();
            } catch (error) {
                console.error('Error loading message threads:', error);
                showToast('Failed to load conversations', 'error');
                throw error;
            } finally {
                hideLoading();
            }
        }
        
        async function loadAllUsers() {
            try {
                showLoading();
                const response = await fetch('http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=get_assigned_members', {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to load users');
                }
                
                allUsers = await response.json();
                console.log('All users:', allUsers);
                populateRecipientSelect();
            } catch (error) {
                console.error('Error loading users:', error);
                showToast('Failed to load members', 'error');
                throw error;
            } finally {
                hideLoading();
            }
        }
        

        
        function renderMessageThreads() {
          messagesList.innerHTML = '';
          
          if (messageThreads.length === 0) {
            messagesList.innerHTML = '<p class="no-messages">No messages yet</p>';
            return;
          }
          
          messageThreads.forEach(thread => {
            console.log('Thread:', thread);
            const threadElement = document.createElement('div');
            threadElement.className = `message-thread ${thread.unread >= 1 ? 'unread-message' : ''}`;
            threadElement.dataset.threadId = thread.threadId;
            threadElement.dataset.otherUserId = thread.otherUserId;
            
            threadElement.innerHTML = `
              <div class="message-thread-header">
                <span class="message-sender">${thread.otherUserName}</span>
                <span class="message-time">${formatTime(thread.lastMessageTime)}</span>
              </div>
              <div class="message-preview">${thread.lastMessageText}</div>
            `;
            
            threadElement.addEventListener('click', () => openThread(thread.otherUserId, thread.otherUserName, thread.otherUserPhone));
            messagesList.appendChild(threadElement);
          });
        }
        
        function populateRecipientSelect() {
          recipientSelect.innerHTML = '<option value="">Select a recipient</option>';
          
          // Filter out the current user
          const otherUsers = allUsers.filter(user => user.member_id !== currentUserId);
          
          otherUsers.forEach(user => {
            const option = document.createElement('option');
            option.value = user.member_id;
            option.textContent = `${user.fullName} (${user.phone})`;
            recipientSelect.appendChild(option);
            console.log('User:', user);
          });
        }
        
        async function openThread(userId, userName, userPhone) {
          showLoading();
          currentRecipientId = userId;
          console.log('Opening thread with user ID:', userId);
          
          try {
            // Update UI
            chatHeader.innerHTML = `
              <div class="chat-header-info">
                <div>
                  <div class="chat-recipient-name">${userName}</div>
                  <div class="chat-recipient-phone">${userPhone}</div>
                </div>
              </div>
            `;
            
            chatInputArea.classList.remove('hidden');
            
            // Load messages for this thread
            await loadMessages(userId);
            
            // Mark messages as read
            await markMessagesAsRead(userId);
            
            // Update the threads list to reflect read status
            await loadMessageThreads();
            
            hideLoading();
          } catch (error) {
            hideLoading();
            showToast('Failed to load messages', 'error');
            console.error('Error opening thread:', error);
          }
        }
        
        async function loadMessages(otherUserId) {
          try {
            const response = await fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=get_messages&userId=${currentUserId}&otherUserId=${otherUserId}`, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
              }
            });
            
            if (!response.ok) {
              throw new Error('Failed to load messages');
            }
            
            const messages = await response.json();
            console.log('Messages:', messages);
            renderMessages(messages);
          } catch (error) {
            console.error('Error loading messages:', error);
            throw error;
          }
        }
        
        function renderMessages(messages) {
          chatMessages.innerHTML = '';
          
          if (messages.length === 0) {
            chatMessages.innerHTML = '<p class="no-messages">No messages yet. Start the conversation!</p>';
            return;
          }
          
          messages.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.className = `message ${message.from_user_id === currentUserId ? 'message-outgoing' : 'message-incoming'}`;
            
            messageElement.innerHTML = `
              <div class="message-content">${message.text}</div>
              <div class="message-time">${formatTime(message.created_at)}</div>
            `;
            
            chatMessages.appendChild(messageElement);
          });
          
          // Scroll to bottom
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
        
        async function markMessagesAsRead(otherUserId) {
            console.log('Marking messages as read for user ID:', otherUserId);
          try {
            await fetch(`http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=mark_as_read`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                userId: currentUserId,
                otherUserId: otherUserId
              })
            });
          } catch (error) {
            console.error('Error marking messages as read:', error);
          }
        }
        
        // Event Listeners
        sendMessageBtn.addEventListener('click', sendMessage);
        messageInput.addEventListener('keypress', function(e) {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        });
        
        newMessageBtn.addEventListener('click', () => {
          newMessagePopup.classList.remove('hidden');
        });
        
        cancelNewMessageBtn.addEventListener('click', () => {
          newMessagePopup.classList.add('hidden');
          newMessageText.value = '';
        });
        
        submitNewMessageBtn.addEventListener('click', sendNewMessage);
        
        async function sendMessage() {
          const text = messageInput.value.trim();
          if (!text || !currentRecipientId) return;
          
          showLoading();
          
          try {
            const response = await fetch('http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=send', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from_user_id: currentUserId,
                to_user_id: currentRecipientId,
                text: text
              })
            });
            
            if (!response.ok) {
              throw new Error('Failed to send message');
            }
            
            // Clear input
            messageInput.value = '';
            
            // Reload messages and threads
            await Promise.all([
              loadMessages(currentRecipientId),
              loadMessageThreads()
            ]);
            
            hideLoading();
            showToast('Message sent', 'success');
          } catch (error) {
            hideLoading();
            showToast('Failed to send message', 'error');
            console.error('Error sending message:', error);
          }
        }
        
        async function sendNewMessage() {
          const recipientId = recipientSelect.value;
          const text = newMessageText.value.trim();
          
          if (!recipientId || !text) {
            showToast('Please select a recipient and enter a message', 'error');
            return;
          }
          
          showLoading();
          
          try {
            const response = await fetch('http://localhost:8080/Group_Project_48/backend/api/controllers/trainerController.php?action=send', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                from_user_id: currentUserId,
                to_user_id: recipientId,
                text: text
              })
            });
            
            if (!response.ok) {
              throw new Error('Failed to send message');
            }
            
            // Clear and close
            newMessageText.value = '';
            newMessagePopup.classList.add('hidden');
            
            // Find recipient info to open the thread
            const recipient = allUsers.find(user => user.id == recipientId);
            if (recipient) {
              await openThread(recipient.id, recipient.name, recipient.phone);
            }
            
            // Reload threads
            await loadMessageThreads();
            
            hideLoading();
            showToast('Message sent', 'success');
          } catch (error) {
            hideLoading();
            showToast('Failed to send message', 'error');
            console.error('Error sending new message:', error);
          }
        }
        
        // Helper functions
        function formatTime(timestamp) {
          const date = new Date(timestamp);
          return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        function showLoading() {
            console.log('Showing loading spinner');
            if (spinner) {
                spinner.classList.remove('hidden');
            } else {
                console.error('Spinner element not found');
            }
        }
        
        function hideLoading() {
            console.log('Hiding loading spinner');
            if (spinner) {
                spinner.classList.add('hidden');
            } else {
                console.error('Spinner element not found');
            }
        }
        
        function showToast(message, type = 'success') {
          const toast = document.createElement('div');
          toast.className = `toast ${type}`;
          toast.textContent = message;
          toastContainer.appendChild(toast);
          
          // Remove toast after animation
          setTimeout(() => {
            toast.remove();
          }, 4000);
        }
    
}
