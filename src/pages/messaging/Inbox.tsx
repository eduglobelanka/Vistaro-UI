import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Divider,
  TextField,
  IconButton,
  Card,
  CardContent,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Send,
  Search,
  ChatBubbleOutlined,
  WorkOutlined,
  CheckCircleOutlined,
  HighlightOff,
  Store,
  Person,
  ArrowBack,
} from '@mui/icons-material';
import useAuth from '../../hooks/useAuth';
import messagingService from '../../services/messaging.service';
import studentService from '../../services/student.service';
import type { MessageResponseDto } from '../../types/messaging';
import { MessageType, InvitationStatus } from '../../types/messaging';
import { parseApiError } from '../../services/api-client';

interface ConversationItem {
  id: string;
  otherUserId: string;
  otherProfileId: string;
  otherName: string;
  lastMessageText: string;
  lastMessageTime: string;
  unreadCount: number;
  jobApplicationId: string;
  jobTitle: string;
}

export const Inbox: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Route query params (e.g. initiating chat from application/profile)
  const queryUserId = searchParams.get('userId');
  const queryProfileId = searchParams.get('profileId');
  const queryName = searchParams.get('name');
  const queryJobApplicationId = searchParams.get('jobApplicationId');

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [activeUser, setActiveUser] = useState<{ userId: string; profileId: string; name: string; jobApplicationId: string; jobTitle: string } | null>(null);
  const [chatLog, setChatLog] = useState<MessageResponseDto[]>([]);
  const [inputText, setInputText] = useState('');

  const [loadingInbox, setLoadingInbox] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Student own profile state
  const [studentProfileId, setStudentProfileId] = useState<string | null>(null);

  // Responsive mobile states
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileShowChat, setMobileShowChat] = useState(false);

  useEffect(() => {
    if (user?.roles.includes('Student')) {
      studentService.getProfile()
        .then((res) => {
          if (res.succeeded && res.data) {
            setStudentProfileId(res.data.id);
          }
        })
        .catch(() => { });
    }
  }, [user]);

  const [searchQuery, setSearchQuery] = useState('');
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Polling intervals
  useEffect(() => {
    fetchInbox();

    // Poll inbox every 10 seconds
    const inboxTimer = setInterval(() => {
      fetchInbox();
    }, 10000);

    return () => clearInterval(inboxTimer);
  }, []);

  // Poll active chat log every 5 seconds
  useEffect(() => {
    if (!activeUser) return;

    fetchChatLog(activeUser.userId, activeUser.jobApplicationId, false);

    const chatTimer = setInterval(() => {
      fetchChatLog(activeUser.userId, activeUser.jobApplicationId, false);
    }, 5000);

    return () => clearInterval(chatTimer);
  }, [activeUser]);

  // Handle route query params for initiating conversation
  useEffect(() => {
    if (queryUserId && queryProfileId && queryName) {
      const activeObj = {
        userId: queryUserId,
        profileId: queryProfileId,
        name: queryName,
        jobApplicationId: queryJobApplicationId || '',
        jobTitle: 'Job Application',
      };

      // Select the conversation
      setActiveUser(activeObj);
      fetchChatLog(queryUserId, queryJobApplicationId || '', true);
      setMobileShowChat(true);

      // Inject temporary conversation placeholder if not in inbox yet
      setConversations((prev) => {
        const exists = prev.some((c) => c.otherUserId === queryUserId);
        if (exists) return prev;

        const newItem: ConversationItem = {
          id: queryJobApplicationId || '',
          otherUserId: queryUserId,
          otherProfileId: queryProfileId,
          otherName: queryName,
          lastMessageText: 'Starting conversation...',
          lastMessageTime: new Date().toISOString(),
          unreadCount: 0,
          jobApplicationId: queryJobApplicationId || '',
          jobTitle: 'Job Application',
        };
        return [newItem, ...prev];
      });

      // Clear search parameters to avoid re-triggering
      setSearchParams({});
    }
  }, [queryUserId, queryProfileId, queryName, queryJobApplicationId]);

  // Scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  const fetchInbox = async () => {
    try {
      const response = await messagingService.getInbox();
      if (response.succeeded && response.data) {
        processInbox(response.data);
      }
    } catch {
      // Quiet fail
    } finally {
      setLoadingInbox(false);
    }
  };

  const processInbox = (messages: MessageResponseDto[]) => {
    const isStudent = user?.roles.includes('Student');
    const grouped: { [key: string]: MessageResponseDto[] } = {};

    messages.forEach((msg) => {
      const key = msg.jobApplicationId;
      if (!key) return; // Ignore legacy messages without jobApplicationId
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(msg);
    });

    const items: ConversationItem[] = Object.keys(grouped).map((key) => {
      const thread = grouped[key];
      const latestMsg = thread[0]; // Ordered by CreatedAt desc
      const otherUserId = latestMsg.senderUserId === user?.id ? latestMsg.receiverUserId : latestMsg.senderUserId;
      const otherProfileId = isStudent ? latestMsg.shopOwnerProfileId : latestMsg.studentProfileId;
      const otherName = isStudent ? latestMsg.shopName : latestMsg.studentFullName;
      const unreadCount = thread.filter((m) => m.receiverUserId === user?.id && !m.isRead).length;

      return {
        id: key, // jobApplicationId
        otherUserId: otherUserId,
        otherProfileId: otherProfileId,
        otherName: otherName,
        lastMessageText: latestMsg.messageText,
        lastMessageTime: latestMsg.createdAt,
        unreadCount: unreadCount,
        jobApplicationId: key,
        jobTitle: latestMsg.relatedJobTitle || 'Job Application',
      };
    });

    setConversations(items);
  };

  const fetchChatLog = async (otherUserId: string, targetJobApplicationId: string, showSpinner = false) => {
    if (showSpinner) setLoadingChat(true);
    try {
      const response = await messagingService.getConversation(otherUserId);
      if (response.succeeded && response.data) {
        // Filter messages for this specific job application
        const filtered = response.data.filter((m) => m.jobApplicationId === targetJobApplicationId);
        setChatLog(filtered);

        // Mark received messages for this application as read
        const unread = filtered.filter((m) => m.receiverUserId === user?.id && !m.isRead);
        for (const msg of unread) {
          try {
            await messagingService.markRead(msg.id);
          } catch {
            // Quiet fail
          }
        }
      }
    } catch {
      setErrorMessage('Failed to fetch chat log.');
    } finally {
      if (showSpinner) setLoadingChat(false);
    }
  };

  const handleSelectConversation = (item: ConversationItem) => {
    const activeObj = {
      userId: item.otherUserId,
      profileId: item.otherProfileId,
      name: item.otherName,
      jobApplicationId: item.jobApplicationId,
      jobTitle: item.jobTitle,
    };
    setActiveUser(activeObj);
    fetchChatLog(item.otherUserId, item.jobApplicationId, true);
    setMobileShowChat(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeUser || !user) return;

    setSendingMessage(true);
    const isStudent = user.roles.includes('Student');

    // Build payload matching SendMessageDto
    const payload = {
      studentProfileId: isStudent ? (studentProfileId || '') : activeUser.profileId,
      shopOwnerProfileId: isStudent ? activeUser.profileId : null,
      messageText: inputText.trim(),
      messageType: MessageType.GeneralMessage,
      jobApplicationId: activeUser.jobApplicationId,
    };

    try {
      const response = await messagingService.sendMessage(payload);
      if (response.succeeded && response.data) {
        setInputText('');
        setChatLog((prev) => [...prev, response.data!]);

        // Refresh inbox
        fetchInbox();
      }
    } catch (err: any) {
      setErrorMessage(parseApiError(err));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleRespondInvitation = async (messageId: string, status: InvitationStatus) => {
    setErrorMessage(null);
    try {
      const response = await messagingService.updateInvitationStatus(messageId, status);
      if (response.succeeded && response.data) {
        // Update local chat log state
        setChatLog((prev) =>
          prev.map((msg) => (msg.id === messageId ? response.data! : msg))
        );
      }
    } catch {
      setErrorMessage('Failed to update job invitation response.');
    }
  };

  const filteredConversations = conversations.filter((c) =>
    c.otherName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loadingInbox && conversations.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexGrow: 1, height: 'calc(100vh - 140px)', minHeight: 400 }}>
      <Grid container spacing={0} sx={{ height: '100%', border: '1px solid #e2e8f0', borderRadius: 4, overflow: 'hidden', bgcolor: '#ffffff' }}>

        {/* LEFT COLUMN: Sidebar Conversation List */}
        <Grid size={{ xs: 12, md: 4 }} sx={{ borderRight: '1px solid #e2e8f0', display: { xs: mobileShowChat ? 'none' : 'flex', md: 'flex' }, flexDirection: 'column', height: '100%' }}>
          <Box sx={{ p: 2, bgcolor: '#f8fafc' }}>
            <Typography variant="h6" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 800, color: '#0f2c59', mb: 2 }}>
              Conversations
            </Typography>
            <TextField
              fullWidth
              size="small"
              placeholder="Search chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: <Search sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />,
                }
              }}
              sx={{ bgcolor: '#ffffff' }}
            />
          </Box>
          <Divider />

          <List sx={{ flexGrow: 1, overflowY: 'auto', p: 0 }}>
            {filteredConversations.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <ChatBubbleOutlined sx={{ fontSize: 32, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">
                  No active chats
                </Typography>
              </Box>
            ) : (
              filteredConversations.map((item) => {
                const isActive = activeUser?.jobApplicationId === item.jobApplicationId;
                return (
                  <React.Fragment key={item.jobApplicationId}>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => handleSelectConversation(item)}
                        selected={isActive}
                        sx={{
                          py: 2,
                          px: 2.5,
                          '&.Mui-selected': {
                            bgcolor: 'rgba(13, 148, 136, 0.08)',
                            borderLeft: '4px solid #0d9488',
                            '&:hover': {
                              bgcolor: 'rgba(13, 148, 136, 0.12)',
                            },
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: isActive ? 'secondary.main' : 'primary.main', fontWeight: 700 }}>
                            {getInitials(item.otherName)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f2c59' }}>
                                {item.otherName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(item.lastMessageTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </Typography>
                            </Box>
                          }
                          secondary={
                            <Box sx={{ mt: 0.25 }}>
                              <Typography variant="caption" sx={{ color: 'secondary.main', fontWeight: 700, display: 'block', mb: 0.5 }}>
                                {item.jobTitle}
                              </Typography>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  noWrap
                                  sx={{ maxWidth: '85%', fontSize: '0.85rem' }}
                                >
                                  {item.lastMessageText}
                                </Typography>
                                {item.unreadCount > 0 && (
                                  <Chip
                                    label={item.unreadCount}
                                    color="error"
                                    size="small"
                                    sx={{ height: 18, fontSize: '0.7rem', fontWeight: 700 }}
                                  />
                                )}
                              </Box>
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                );
              })
            )}
          </List>
        </Grid>

        {/* RIGHT COLUMN: Chat Area */}
        <Grid size={{ xs: 12, md: 8 }} sx={{ display: { xs: mobileShowChat ? 'flex' : 'none', md: 'flex' }, flexDirection: 'column', height: '100%', bgcolor: '#f8fafc' }}>
          {activeUser ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

              {/* Chat Header */}
              <Box sx={{ p: 2, bgcolor: '#ffffff', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {isMobile && (
                  <IconButton onClick={() => setMobileShowChat(false)} sx={{ mr: 1, p: 0.5 }}>
                    <ArrowBack />
                  </IconButton>
                )}
                <Avatar sx={{ bgcolor: 'secondary.main', fontWeight: 700 }}>
                  {getInitials(activeUser.name)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f2c59', lineHeight: 1.2 }}>
                    {activeUser.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                    {user?.roles.includes('Student') ? <Store sx={{ fontSize: 12 }} /> : <Person sx={{ fontSize: 12 }} />}
                    {user?.roles.includes('Student') ? 'Employer Partner' : 'Candidate Student'}
                  </Typography>
                  <Typography variant="caption" color="secondary.main" sx={{ display: 'block', fontWeight: 700, mt: 0.25 }}>
                    Regarding: {activeUser.jobTitle}
                  </Typography>
                </Box>
              </Box>

              {errorMessage && (
                <Alert severity="error" onClose={() => setErrorMessage(null)} sx={{ m: 2, mb: 0 }}>
                  {errorMessage}
                </Alert>
              )}

              {/* Chat Messages Stream */}
              <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3, display: 'flex', flexDirection: 'column', gap: 2 }}>
                {loadingChat ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <CircularProgress color="primary" />
                  </Box>
                ) : (
                  chatLog.map((msg) => {
                    const isSelf = msg.senderUserId === user?.id;
                    return (
                      <Box key={msg.id} sx={{ display: 'flex', justifyContent: isSelf ? 'flex-end' : 'flex-start' }}>
                        {msg.messageType === MessageType.JobInvitation ? (
                          /* JOB INVITATION SPECIAL CARD */
                          <Card sx={{ maxWidth: 380, width: '100%', border: '1px solid', borderColor: 'secondary.light', boxShadow: '0 4px 12px rgba(13,148,136,0.08)' }}>
                            <CardContent sx={{ p: 2.5 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.5, color: 'secondary.main', mb: 1.5 }}>
                                <WorkOutlined sx={{ fontSize: 16 }} /> Job Opportunity Invitation
                              </Typography>

                              <Box sx={{ bgcolor: '#f0fdfa', p: 1.5, borderRadius: 2, mb: 2 }}>
                                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#0f2c59' }}>
                                  {msg.relatedJobTitle || 'Job Opening'}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {msg.shopName}
                                </Typography>
                              </Box>

                              <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', mb: 2 }}>
                                {msg.messageText}
                              </Typography>

                              <Divider sx={{ my: 1.5 }} />

                              {msg.invitationStatus === InvitationStatus.Pending ? (
                                user?.roles.includes('Student') ? (
                                  <Stack direction="row" spacing={1.5}>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      color="success"
                                      fullWidth
                                      startIcon={<CheckCircleOutlined />}
                                      onClick={() => handleRespondInvitation(msg.id, InvitationStatus.Accepted)}
                                    >
                                      Accept
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      color="error"
                                      fullWidth
                                      startIcon={<HighlightOff />}
                                      onClick={() => handleRespondInvitation(msg.id, InvitationStatus.Declined)}
                                    >
                                      Decline
                                    </Button>
                                  </Stack>
                                ) : (
                                  <Chip label="Pending Candidate Response" color="warning" size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                                )
                              ) : msg.invitationStatus === InvitationStatus.Accepted ? (
                                <Chip label="Invitation Accepted" color="success" size="small" sx={{ fontWeight: 600 }} />
                              ) : (
                                <Chip label="Invitation Declined" color="default" size="small" sx={{ fontWeight: 600 }} />
                              )}
                            </CardContent>
                          </Card>
                        ) : (
                          /* STANDARD TEXT BUBBLE */
                          <Box sx={{ maxWidth: '70%' }}>
                            <Box
                              sx={{
                                p: 1.75,
                                borderRadius: isSelf ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                                bgcolor: isSelf ? 'primary.main' : '#ffffff',
                                color: isSelf ? '#ffffff' : 'text.primary',
                                boxShadow: isSelf ? 'none' : '0px 1px 3px rgba(0,0,0,0.05)',
                                border: isSelf ? 'none' : '1px solid #e2e8f0',
                              }}
                            >
                              <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.5, fontSize: '0.9rem' }}>
                                {msg.messageText}
                              </Typography>
                            </Box>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ mt: 0.5, display: 'flex', alignItems: 'center', justifyContent: isSelf ? 'flex-end' : 'flex-start', gap: 0.5, fontSize: '0.75rem' }}
                            >
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              {isSelf && msg.moderationStatus === 1 && (
                                <span style={{ color: '#d97706', fontWeight: 600 }}>• Pending Moderation</span>
                              )}
                              {isSelf && msg.moderationStatus === 3 && (
                                <span style={{ color: '#dc2626', fontWeight: 600 }}>• Rejected by Admin</span>
                              )}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    );
                  })
                )}
                <div ref={chatEndRef} />
              </Box>

              {/* Chat Input Bar */}
              <Box component="form" onSubmit={handleSendMessage} sx={{ p: 2, bgcolor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
                <Stack direction="row" spacing={1.5}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Type a message..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    disabled={sendingMessage || (user?.roles.includes('Student') && !studentProfileId)}
                  />
                  <IconButton
                    type="submit"
                    color="primary"
                    disabled={!inputText.trim() || sendingMessage || (user?.roles.includes('Student') && !studentProfileId)}
                    sx={{
                      bgcolor: 'primary.main',
                      color: '#ffffff',
                      '&:hover': { bgcolor: 'primary.dark' },
                      '&.Mui-disabled': { bgcolor: '#f1f5f9', color: '#cbd5e1' },
                    }}
                  >
                    <Send sx={{ fontSize: 18 }} />
                  </IconButton>
                </Stack>
              </Box>

            </Box>
          ) : (
            /* empty state */
            <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', p: 4, textAlign: 'center' }}>
              <ChatBubbleOutlined sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700 }}>
                Your Inbox
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 320, mt: 1 }}>
                Select a conversation thread on the left side to begin exchanging messages.
              </Typography>
            </Box>
          )}
        </Grid>

      </Grid>
    </Box>
  );
};

export default Inbox;
