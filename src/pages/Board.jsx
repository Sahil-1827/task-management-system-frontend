import React, { useState, useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import {
    Box,
    Typography,
    Paper,
    Chip,
    Avatar,
    IconButton,
    Container,
    Grid,
    TextField,
    Button,
    InputAdornment,
    Divider,
    useTheme,
    alpha,
    AvatarGroup,
    Tooltip,
    List,
    ListItem,
    ListItemButton,
    ListItemAvatar,
    ListItemText,
    ClickAwayListener,
    useMediaQuery,
    Tabs,
    Tab
} from '@mui/material';
import {
    Add as AddIcon,
    ChatBubbleOutline as CommentIcon,
    Link as LinkIcon,
    DeleteOutline as DeleteIcon,
    Send as SendIcon,
    Launch as LaunchIcon,
    Person as PersonIcon,
    CheckCircleOutline as CheckCircleIcon,
    Schedule as ClockIcon,
    ListAlt as ListIcon,
    Close as CloseIcon,
    FlagOutlined as FlagIcon,
    MoreHoriz as MoreHorizIcon,
    Reply as ReplyIcon,
    PushPin as PushPinIcon,
    PushPinOutlined as PushPinOutlinedIcon,
    KeyboardArrowDown as ArrowDownIcon,
    Block as BlockIcon,
    Groups as GroupsIcon,
} from '@mui/icons-material';
import { Menu, MenuItem, CircularProgress } from '@mui/material';
import Offcanvas, { OffcanvasHeader, OffcanvasBody, OffcanvasFooter } from '../components/common/Offcanvas';
import EmptyState from '../components/common/EmptyState';
import api from '../api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_SOCKET_URL;
var socket;

const Board = () => {
    const { user } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [tasks, setTasks] = useState({
        'To Do': [],
        'In Progress': [],
        'Done': []
    });
    const [activeTab, setActiveTab] = useState('To Do');
    const [allTasksList, setAllTasksList] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedComment, setSelectedComment] = useState(null);
    const [highlightedCommentId, setHighlightedCommentId] = useState(null);
    const [activePinIndex, setActivePinIndex] = useState(0);
    const [newComment, setNewComment] = useState('');
    const [newLinkTitle, setNewLinkTitle] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [mentionQuery, setMentionQuery] = useState(null);
    const [mentionCursorPos, setMentionCursorPos] = useState(null);
    const [taskMenuAnchorEl, setTaskMenuAnchorEl] = useState(null);
    const [activeMenuTask, setActiveMenuTask] = useState(null);
    const [isCommentLoading, setIsCommentLoading] = useState(false);
    const [isLinkLoading, setIsLinkLoading] = useState(false);
    const inputRef = useRef(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("join", user?._id);
        fetchTasks();
        return () => {
            socket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTo({
                top: chatContainerRef.current.scrollHeight,
                behavior: "smooth"
            });
        }
    }, [comments, selectedTask]);

    useEffect(() => {
        if (!selectedTask) {
            setComments([]);
            return;
        }

        const fetchComments = async () => {
            try {
                const res = await api.get(`/comments/task/${selectedTask._id}`);
                setComments(res.data);
            } catch (error) {
                console.error("Failed to load comments", error);
            }
        };
        fetchComments();

        socket.emit("joinTask", selectedTask._id);

        const handleCommentAdded = (newComment) => {
            if (newComment.task === selectedTask._id) {
                setComments(prev => {
                    if (prev.some(c => c._id === newComment._id)) return prev;
                    return [...prev, newComment];
                });
                const updatedTask = { ...selectedTask, commentCount: (selectedTask.commentCount || 0) + 1 };
                updateLocalTask(updatedTask);
            }
        };

        const handleCommentDeleted = (commentId) => {
            setComments(prev => prev.filter(c => c._id !== commentId));
            if (selectedTask) {
                const updatedTask = { ...selectedTask, commentCount: Math.max(0, (selectedTask.commentCount || 1) - 1) };
                updateLocalTask(updatedTask);
            }
        };

        const handleCommentUpdated = (updatedComment) => {
            setComments(prev => prev.map(c => c._id === updatedComment._id ? updatedComment : c));
        };

        socket.on("commentAdded", handleCommentAdded);
        socket.on("commentDeleted", handleCommentDeleted);
        socket.on("commentUpdated", handleCommentUpdated);

        return () => {
            socket.emit("leaveTask", selectedTask._id);
            socket.off("commentAdded", handleCommentAdded);
            socket.off("commentDeleted", handleCommentDeleted);
            socket.off("commentUpdated", handleCommentUpdated);
        };

    }, [selectedTask]);

    const scrollToMessage = (commentId) => {
        const element = document.getElementById(`comment-${commentId}`);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setHighlightedCommentId(commentId);
            setTimeout(() => setHighlightedCommentId(null), 2000);
        }
    };

    const handlePinHeaderClick = () => {
        const pinnedComments = comments.filter(c => c.isPinned);
        if (pinnedComments.length === 0) return;

        const nextIndex = (activePinIndex + 1) % pinnedComments.length;
        setActivePinIndex(nextIndex);
        scrollToMessage(pinnedComments[nextIndex]._id);
    };

    const fetchTasks = async () => {
        try {
            const response = await api.get('/tasks?limit=100');
            setAllTasksList(response.data.tasks);
            const newTasks = { 'To Do': [], 'In Progress': [], 'Done': [] };
            response.data.tasks.forEach(task => {
                if (newTasks[task.status]) newTasks[task.status].push(task);
            });
            setTasks(newTasks);
        } catch (error) {
            toast.error('Failed to load tasks');
        }
    };

    const updateLocalTask = (updatedTask) => {
        const updatedList = allTasksList.map(t => t._id === updatedTask._id ? updatedTask : t);
        setAllTasksList(updatedList);

        const newTasks = { 'To Do': [], 'In Progress': [], 'Done': [] };
        updatedList.forEach(task => {
            if (newTasks[task.status]) newTasks[task.status].push(task);
        });
        setTasks(newTasks);

        if (selectedTask && selectedTask._id === updatedTask._id) {
            setSelectedTask(prev => ({ ...prev, ...updatedTask }));
        }
    };

    const onDragEnd = async (result) => {
        if (user?.role === 'admin') return;

        const { source, destination, draggableId } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        const sourceColumn = tasks[source.droppableId];
        const destColumn = tasks[destination.droppableId];
        const taskToMove = sourceColumn.find(t => t._id === draggableId);

        const newSourceColumn = Array.from(sourceColumn);
        newSourceColumn.splice(source.index, 1);

        const newDestColumn = Array.from(destColumn);
        let updatedTask = { ...taskToMove, status: destination.droppableId };

        if (source.droppableId === destination.droppableId) {
            newDestColumn.splice(source.index, 1);
            newDestColumn.splice(destination.index, 0, updatedTask);
            setTasks({ ...tasks, [source.droppableId]: newDestColumn });
        } else {
            newDestColumn.splice(destination.index, 0, updatedTask);
            setTasks({
                ...tasks,
                [source.droppableId]: newSourceColumn,
                [destination.droppableId]: newDestColumn
            });
        }

        try {
            await api.put(`/tasks/${draggableId}`, { status: destination.droppableId });
            toast.success(`Moved to ${destination.droppableId}`);
            updateLocalTask(updatedTask);
        } catch (error) {
            toast.error('Failed to update status');
            fetchTasks();
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !selectedTask) return;

        setIsCommentLoading(true);
        try {
            const res = await api.post('/comments', {
                text: newComment,
                taskId: selectedTask._id,
                replyTo: replyingTo?._id
            });

            setReplyingTo(null);

            setComments(prev => {
                if (prev.some(c => c._id === res.data._id)) return prev;
                return [...prev, res.data];
            });

            setNewComment('');
            const updatedTask = { ...selectedTask, commentCount: (selectedTask.commentCount || 0) + 1 };
            updateLocalTask(updatedTask);
        } catch (error) {
            console.error(error);
            toast.error("Failed to add comment");
        } finally {
            setIsCommentLoading(false);
        }
    };

    const handleCommentChange = (e) => {
        const value = e.target.value;
        const cursorPos = e.target.selectionStart;
        setNewComment(value);

        const lastAtPos = value.lastIndexOf('@', cursorPos - 1);
        if (lastAtPos !== -1) {
            const query = value.substring(lastAtPos + 1, cursorPos);
            const isValid = (lastAtPos === 0 || value[lastAtPos - 1] === ' ') && !query.includes(' ');

            if (isValid) {
                setMentionQuery(query);
                setMentionCursorPos(lastAtPos);
                return;
            }
        }
        setMentionQuery(null);
        setMentionCursorPos(null);
    };

    const getMentionableUsers = () => {
        if (!selectedTask) return [];
        const users = new Map();

        selectedTask.assignees?.forEach(u => users.set(u._id, { ...u, type: 'Assignee' }));

        selectedTask.team?.members?.forEach(m => {
            if (!users.has(m._id)) users.set(m._id, { ...m, type: 'Team Member' });
        });

        const userArray = Array.from(users.values());

        if (userArray.length > 1) {
            userArray.unshift({
                _id: 'everyone',
                name: 'Everyone',
                type: 'Notify everyone in the chat',
                isSpecial: true
            });
        }

        return userArray;
    };

    const insertMention = (user) => {
        if (mentionCursorPos === null) return;

        const before = newComment.substring(0, mentionCursorPos);
        const after = newComment.substring(inputRef.current?.selectionStart || newComment.length);
        const newValue = `${before}@${user.name} ${after}`;

        setNewComment(newValue);
        setMentionQuery(null);
        setMentionCursorPos(null);

        setTimeout(() => {
            inputRef.current?.focus();
        }, 0);
    };

    const filteredUsers = mentionQuery !== null
        ? getMentionableUsers().filter(u => u.name.toLowerCase().includes(mentionQuery.toLowerCase()))
        : [];

    const handleAddLink = async (e) => {
        e.preventDefault();
        if (!newLinkTitle.trim() || !newLinkUrl.trim() || !selectedTask) return;

        setIsLinkLoading(true);
        try {
            let url = newLinkUrl;
            if (!url.startsWith('http')) url = `https://${url}`;

            const res = await api.post(`/tasks/${selectedTask._id}/links`, { title: newLinkTitle, url });
            const updatedTask = { ...selectedTask, links: res.data };
            updateLocalTask(updatedTask);
            setNewLinkTitle('');
            setNewLinkUrl('');
        } catch (error) {
            toast.error("Failed to add link");
        } finally {
            setIsLinkLoading(false);
        }
    };

    const handleDeleteLink = async (link) => {
        if (!selectedTask || !link) return;
        try {
            const res = await api.delete(`/tasks/${selectedTask._id}/links/${link._id}`);
            const updatedTask = { ...selectedTask, links: res.data };
            updateLocalTask(updatedTask);
            toast.success("Link deleted");
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete link");
        }
    };

    const handleTaskMenuOpen = (event, task) => {
        event.stopPropagation();
        setTaskMenuAnchorEl(event.currentTarget);
        setActiveMenuTask(task);
    };

    const handleTaskMenuClose = () => {
        setTaskMenuAnchorEl(null);
        setActiveMenuTask(null);
    };

    const handleMoveTask = async (newStatus) => {
        if (!activeMenuTask) return;

        const updatedTask = { ...activeMenuTask, status: newStatus };

        try {
            updateLocalTask(updatedTask);
            handleTaskMenuClose();
            await api.put(`/tasks/${activeMenuTask._id}`, { status: newStatus });
            toast.success(`Moved to ${newStatus}`);
        } catch (error) {
            toast.error('Failed to update status');
            fetchTasks();
        }
    };



    const handleMenuClick = (event, comment) => {
        setAnchorEl(event.currentTarget);
        setSelectedComment(comment);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedComment(null);
    };

    const handlePinComment = async () => {
        if (!selectedComment) return;
        try {
            await api.put(`/comments/${selectedComment._id}/pin`);
            handleMenuClose();
        } catch (error) {
            toast.error("Failed to update pin status");
        }
    };

    const handleDeleteComment = async () => {
        if (!selectedComment) return;
        try {
            await api.delete(`/comments/${selectedComment._id}`);
            handleMenuClose();
        } catch (error) {
            toast.error("Failed to delete comment");
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'High': return '#ffebee';
            case 'Medium': return '#fff8e1';
            case 'Low': return '#e3f2fd';
            default: return theme.palette.action.hover;
        }
    };

    const getPriorityTextColor = (priority) => {
        switch (priority) {
            case 'High': return '#d32f2f';
            case 'Medium': return '#f57c00';
            case 'Low': return '#1976d2';
            default: return theme.palette.text.secondary;
        }
    };

    const renderCommentText = (text) => {
        if (!text) return null;
        if (typeof text !== 'string') return text;

        const parts = text.split(/(@\S+)/g);

        return parts.map((part, index) => {
            if (part.match(/^@\S+/)) {
                return (
                    <Box
                        component="span"
                        key={index}
                        sx={{
                            color: 'primary.main',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                        }}
                    >
                        {part}
                    </Box>
                );
            }
            return <span key={index}>{part}</span>;
        });
    };

    return (
        <Container maxWidth="2xl" sx={{ pt: 3, height: 'calc(100vh - 64px)' }}>
            <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box>
                    <Typography variant="h4" fontWeight="900" sx={{ letterSpacing: '-0.5px', color: 'text.primary' }}>
                        Board
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Keep track of your team's tasks all in one place.
                    </Typography>
                </Box>
            </Box>

            <Grid container spacing={3} sx={{ height: 'calc(100% - 64px)' }}>
                <Grid size={{ xs: 12 }} sx={{ height: '100%', overflow: 'hidden' }}>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            height: '100%',
                            overflow: 'hidden'
                        }}>
                            {isMobile && (
                                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                                    <Tabs
                                        value={activeTab}
                                        onChange={(e, newValue) => setActiveTab(newValue)}
                                        variant="fullWidth"
                                        textColor="primary"
                                        indicatorColor="primary"
                                    >
                                        <Tab label="To Do" value="To Do" />
                                        <Tab label="In Progress" value="In Progress" />
                                        <Tab label="Done" value="Done" />
                                    </Tabs>
                                </Box>
                            )}

                            <Box sx={{
                                display: 'flex',
                                gap: 3,
                                height: '100%',
                                overflowX: isMobile ? 'hidden' : 'auto',
                                pb: 1,
                                '& > div': {
                                    flex: 1,
                                    minWidth: isMobile ? '100%' : '280px',
                                }
                            }}>
                                {['To Do', 'In Progress', 'Done'].filter(id => !isMobile || id === activeTab).map(columnId => (
                                    <Box
                                        key={columnId}
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            height: '100%',
                                            width: isMobile ? '100%' : 'auto'
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{
                                                    width: 8, height: 8, borderRadius: '50%', bgcolor:
                                                        columnId === 'To Do' ? '#fbbf24' :
                                                            columnId === 'In Progress' ? '#3b82f6' :
                                                                '#a855f7'
                                                }} />
                                                <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
                                                    {columnId}
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        bgcolor: alpha(theme.palette.text.primary, 0.1),
                                                        color: 'text.secondary',
                                                        borderRadius: '50%',
                                                        width: 20,
                                                        height: 20,
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 'bold'
                                                    }}
                                                >
                                                    {tasks[columnId]?.length || 0}
                                                </Box>
                                            </Box>
                                        </Box>

                                        <Droppable droppableId={columnId}>
                                            {(provided) => (
                                                <Box
                                                    {...provided.droppableProps}
                                                    ref={provided.innerRef}
                                                    sx={{
                                                        flexGrow: 1,
                                                        overflowY: 'auto',
                                                        pr: 1,
                                                        bgcolor: alpha(theme.palette.background.default, 0.4),
                                                        borderRadius: 2,
                                                        p: 1,
                                                        border: '1px solid', borderColor: 'divider',
                                                        minHeight: '200px'
                                                    }}
                                                >
                                                    {tasks[columnId]?.length === 0 ? (
                                                        <Box sx={{ mt: 4 }}>
                                                            <EmptyState
                                                                title="No Tasks"
                                                                description={`No tasks in ${columnId}`}
                                                                icon={ListIcon}
                                                                height="auto"
                                                            />
                                                        </Box>
                                                    ) : (
                                                        tasks[columnId]?.map((task, index) => (
                                                            <Draggable
                                                                key={task._id}
                                                                draggableId={task._id}
                                                                index={index}
                                                                isDragDisabled={user?.role === 'admin'}
                                                            >
                                                                {(provided) => (
                                                                    <Paper
                                                                        ref={provided.innerRef}
                                                                        {...provided.draggableProps}
                                                                        {...provided.dragHandleProps}
                                                                        onClick={() => setSelectedTask(task)}
                                                                        elevation={0}
                                                                        sx={{
                                                                            p: 2,
                                                                            mb: 2,
                                                                            borderRadius: 3,
                                                                            border: '2px solid',
                                                                            borderColor: 'divider',
                                                                            bgcolor: 'background.paper',
                                                                            cursor: 'pointer',
                                                                            transition: 'all 0.2s',
                                                                            '&:hover': {
                                                                                borderColor: 'primary.light',
                                                                                boxShadow: theme.shadows[2]
                                                                            }
                                                                        }}
                                                                    >
                                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                                                                            <Chip
                                                                                label={task.priority}
                                                                                size="small"
                                                                                sx={{
                                                                                    height: 22,
                                                                                    fontSize: '0.7rem',
                                                                                    fontWeight: 600,
                                                                                    bgcolor: alpha(getPriorityColor(task.priority), 0.5),
                                                                                    color: getPriorityTextColor(task.priority),
                                                                                }}
                                                                            />
                                                                            {isMobile && (
                                                                                <IconButton
                                                                                    size="small"
                                                                                    onClick={(e) => handleTaskMenuOpen(e, task)}
                                                                                    sx={{ p: 0.5, mt: -0.5, mr: -0.5 }}
                                                                                >
                                                                                    <MoreHorizIcon fontSize="small" color="action" />
                                                                                </IconButton>
                                                                            )}
                                                                        </Box>

                                                                        <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 1, lineHeight: 1.3, color: 'text.primary' }}>
                                                                            {task.title}
                                                                        </Typography>

                                                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', fontSize: '0.8rem' }}>
                                                                            {task.description || 'No description provided.'}
                                                                        </Typography>

                                                                        <Typography
                                                                            variant="caption"
                                                                            color="text.secondary"
                                                                            sx={{ display: 'block', mb: 1, fontWeight: 500 }}
                                                                        >
                                                                            Assignees to {task.assignees && task.assignees.length > 0
                                                                                ? task.assignees.map((a) => a.name).join(', ')
                                                                                : (task.team?.name || 'Unassigned')} :
                                                                        </Typography>

                                                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                                            {(task.assignees && task.assignees.length > 0) || task.team ? (
                                                                                <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.7rem' } }}>
                                                                                    {task.assignees && task.assignees.length > 0 ? (
                                                                                        task.assignees.map((user, index) => (
                                                                                            <Avatar key={index} src={user.profilePicture} alt={user.name}>
                                                                                                {user.name?.[0]?.toUpperCase()}
                                                                                            </Avatar>
                                                                                        ))
                                                                                    ) : (
                                                                                        task.team && (
                                                                                            <Avatar
                                                                                                src={task.team.profilePicture || task.team?.profilePicture}
                                                                                                alt={task.team.name}
                                                                                            >
                                                                                                {task.team.name?.[0]?.toUpperCase()}
                                                                                            </Avatar>
                                                                                        )
                                                                                    )}
                                                                                </AvatarGroup>
                                                                            ) : (
                                                                                <Typography variant="body2" color="text.secondary">
                                                                                    -
                                                                                </Typography>
                                                                            )}
                                                                        </Box>

                                                                        <Divider sx={{ my: 1.5 }} />

                                                                        <Box
                                                                            sx={{
                                                                                display: 'flex',
                                                                                alignItems: 'center',
                                                                                justifyContent: 'space-between',
                                                                                color: 'text.secondary',
                                                                                width: '100%',
                                                                            }}
                                                                        >
                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                                                                <FlagIcon sx={{ fontSize: 16 }} />
                                                                                <Typography variant="caption" fontWeight={500}>
                                                                                    {task.dueDate
                                                                                        ? new Date(task.dueDate).toLocaleDateString('en-GB', {
                                                                                            day: '2-digit',
                                                                                            month: 'short',
                                                                                            year: 'numeric',
                                                                                        })
                                                                                        : 'No Date'}
                                                                                </Typography>
                                                                            </Box>

                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                                    <CommentIcon sx={{ fontSize: 14 }} />
                                                                                    <Typography variant="caption">
                                                                                        {task.commentCount || 0}
                                                                                    </Typography>
                                                                                </Box>

                                                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                                                    <LinkIcon sx={{ fontSize: 14 }} />
                                                                                    <Typography variant="caption">
                                                                                        {task.links?.length || 0}
                                                                                    </Typography>
                                                                                </Box>
                                                                            </Box>
                                                                        </Box>

                                                                    </Paper>
                                                                )}
                                                            </Draggable>
                                                        ))
                                                    )}
                                                    {provided.placeholder}
                                                </Box>
                                            )}
                                        </Droppable>
                                    </Box>
                                ))}
                            </Box>
                        </Box>
                    </DragDropContext>
                </Grid>
            </Grid>

            <Offcanvas
                open={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                anchor="right"
                width={{ xs: '100%', sm: '80%', md: '50%', lg: '30%' }}
            >
                {selectedTask && (
                    <>
                        <OffcanvasHeader onClose={() => setSelectedTask(null)}>
                            <Box>
                                <Typography variant="h6" fontWeight="bold" color="text.primary" sx={{ lineHeight: 1.2, mb: 0.5 }}>
                                    {selectedTask.title}
                                </Typography>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Chip
                                        label={selectedTask.status}
                                        size="small"
                                        sx={{ height: 20, fontSize: '0.65rem', fontWeight: 600 }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                        {selectedTask.priority} Priority
                                    </Typography>
                                </Box>
                            </Box>
                        </OffcanvasHeader>
                        <OffcanvasBody sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            {/* Task Description & Meta */}
                            <Paper elevation={0} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    {selectedTask.description || 'No description provided.'}
                                </Typography>

                                <Divider sx={{ my: 1.5 }} />

                                <Grid container spacing={2}>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom fontWeight={600}>
                                            Assignees
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            {(selectedTask.assignees?.length > 0 || selectedTask.team) ? (
                                                <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 24, height: 24, fontSize: '0.7rem' } }}>
                                                    {selectedTask.assignees?.length > 0 ? (
                                                        selectedTask.assignees.map((user, index) => (
                                                            <Avatar key={index} src={user.profilePicture} alt={user.name}>
                                                                {user.name?.[0]?.toUpperCase()}
                                                            </Avatar>
                                                        ))
                                                    ) : (
                                                        selectedTask.team && (
                                                            <Avatar src={selectedTask.team.profilePicture || selectedTask.team?.profilePicture} alt={selectedTask.team.name}>
                                                                {selectedTask.team.name?.[0]?.toUpperCase()}
                                                            </Avatar>
                                                        )
                                                    )}
                                                </AvatarGroup>
                                            ) : (
                                                <Typography variant="body2" color="text.secondary">-</Typography>
                                            )}
                                        </Box>
                                    </Grid>
                                    <Grid item xs={6}>
                                        <Typography variant="caption" color="text.secondary" display="block" gutterBottom fontWeight={600}>
                                            Due Date
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                            <FlagIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                            <Typography variant="body2">
                                                {selectedTask.dueDate
                                                    ? new Date(selectedTask.dueDate).toLocaleDateString('en-GB')
                                                    : 'No Date'}
                                            </Typography>
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Paper>

                            {/* Comments Section */}
                            <Paper
                                elevation={0}
                                sx={{
                                    flex: 1,
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                    minHeight: '600px'
                                }}
                            >
                                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', flexDirection: "column", gap: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <CommentIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                                        <Typography variant="subtitle2" fontWeight="bold" color="text.primary">Team Discussion</Typography>
                                    </Box>
                                    <Typography variant="caption" color='error'>
                                        Please Note that comments are deleted after 2 days.
                                    </Typography>
                                </Box>

                                {comments.filter(c => c.isPinned).length > 0 && (
                                    <Box
                                        onClick={handlePinHeaderClick}
                                        sx={{
                                            p: 1,
                                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                                            borderBottom: '1px solid',
                                            borderColor: 'divider',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1.5,
                                            transition: 'background-color 0.2s',
                                            '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.08) }
                                        }}
                                    >
                                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, py: 0.5 }}>
                                            {comments.filter(c => c.isPinned).length > 4 ? (
                                                <Box
                                                    sx={{
                                                        width: 3,
                                                        height: 24,
                                                        bgcolor: 'primary.main',
                                                        borderRadius: 1,
                                                    }}
                                                />
                                            ) : (
                                                comments.filter(c => c.isPinned).map((_, idx) => {
                                                    const count = comments.filter(c => c.isPinned).length;
                                                    const height = count > 0 ? (24 - (count - 1) * 4) / count : 24;

                                                    return (
                                                        <Box
                                                            key={idx}
                                                            sx={{
                                                                width: 3,
                                                                height: height,
                                                                bgcolor: count === 1 ? 'transparent' : (idx === (count > 0 ? (activePinIndex % count) : 0) ? 'primary.main' : alpha(theme.palette.primary.main, 0.2)),
                                                                borderRadius: 1,
                                                                transition: 'all 0.3s'
                                                            }}
                                                        />
                                                    )
                                                })
                                            )}
                                        </Box>

                                        <Box sx={{ flex: 1, overflow: 'hidden' }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <PushPinIcon sx={{ fontSize: 14, color: 'primary.main', transform: 'rotate(45deg)' }} />
                                                <Typography variant="caption" fontWeight="bold" color="primary.main">
                                                    Pinned Message
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" sx={{ fontSize: '0.8rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {comments.filter(c => c.isPinned).length > 0 ? comments.filter(c => c.isPinned)[activePinIndex % comments.filter(c => c.isPinned).length]?.text : ''}
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}

                                <Box ref={chatContainerRef} sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2, minHeight: '200px' }}>
                                    {comments.length === 0 ? (
                                        <EmptyState
                                            title="No comments"
                                            description="No comments have been added to this task yet."
                                            icon={CommentIcon}
                                            height="100%"
                                        />
                                    ) : (
                                        comments.map((comment, idx) => (
                                            <Box key={idx}
                                                id={`comment-${comment._id}`}
                                                sx={{
                                                    display: 'flex',
                                                    gap: 1.5,
                                                    flexDirection: comment.user?._id === user?._id ? 'row-reverse' : 'row',
                                                    transition: 'background-color 0.5s',
                                                    bgcolor: highlightedCommentId === comment._id ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                                                    p: 1,
                                                    borderRadius: 2
                                                }}>
                                                <Avatar
                                                    src={comment.user?.profilePicture}
                                                    alt={comment.user?.name}
                                                    sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: 'primary.light' }}
                                                >
                                                    {comment.user?.name?.[0] || <PersonIcon fontSize="inherit" />}
                                                </Avatar>
                                                <Box sx={{
                                                    bgcolor: comment.user?._id === user?._id ? alpha(theme.palette.primary.light, 0.4) : alpha(theme.palette.background.default, 0.4),
                                                    color: comment.user?._id === user?._id ? 'black' : 'text.primary',
                                                    p: 1.5,
                                                    borderRadius: 2,
                                                    borderRadiusTopLeft: comment.user?._id === user?._id ? 2 : 0,
                                                    borderRadiusTopRight: comment.user?._id === user?._id ? 0 : 2,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    maxWidth: '85%',
                                                    position: 'relative',
                                                    '&:hover .reply-btn': { opacity: 1 }
                                                }}>
                                                    {comment.replyTo && (
                                                        <Box sx={{
                                                            mb: 1,
                                                            p: 0.5,
                                                            px: 1,
                                                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                                                            borderLeft: '3px solid',
                                                            borderColor: 'primary.main',
                                                            borderRadius: 1
                                                        }}>
                                                            <Typography variant="caption" fontWeight="bold" color="primary">
                                                                {comment.replyTo.user?.name}
                                                            </Typography>
                                                            <Typography variant="body2" sx={{ fontSize: '0.7rem', opacity: 0.8, maxHeight: 40, overflow: 'hidden' }}>
                                                                {comment.replyTo.text}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5, gap: 1 }}>
                                                        <Typography variant="subtitle2" sx={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
                                                            {comment.user?.name || 'User'}
                                                        </Typography>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                            <Typography variant="caption" sx={{ fontSize: '0.65rem', opacity: 0.7 }}>
                                                                {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </Typography>
                                                            {comment.isPinned && !comment.isDeleted && (
                                                                <PushPinIcon sx={{ fontSize: 12, transform: 'rotate(45deg)', color: 'text.secondary' }} />
                                                            )}
                                                            {!comment.isDeleted && (
                                                                <IconButton
                                                                    className="reply-btn"
                                                                    size="small"
                                                                    sx={{ padding: 0.2, opacity: 0, transition: 'opacity 0.2s', color: 'inherit' }}
                                                                    onClick={(e) => handleMenuClick(e, comment)}
                                                                >
                                                                    <MoreHorizIcon sx={{ fontSize: 14 }} />
                                                                </IconButton>
                                                            )}
                                                        </Box>
                                                    </Box>
                                                    {comment.isDeleted ? (
                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontStyle: 'italic', color: 'text.secondary', opacity: 0.7 }}>
                                                            <BlockIcon sx={{ fontSize: 14 }} />
                                                            <Typography variant="caption" sx={{ fontSize: '0.75rem' }}>
                                                                {comment.user?._id === user?._id ? "You deleted this message" : "This message was deleted"}
                                                            </Typography>
                                                        </Box>
                                                    ) : (
                                                        <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                                            {renderCommentText(comment.text)}
                                                        </Typography>
                                                    )}
                                                </Box>

                                                <Menu
                                                    anchorEl={anchorEl}
                                                    open={Boolean(anchorEl) && selectedComment?._id === comment._id}
                                                    onClose={handleMenuClose}
                                                    PaperProps={{ elevation: 3, sx: { borderRadius: 2, minWidth: 120 } }}
                                                >
                                                    <MenuItem onClick={() => { setReplyingTo(selectedComment); handleMenuClose(); }} dense>
                                                        <ReplyIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />
                                                        <Typography variant="caption">Reply</Typography>
                                                    </MenuItem>
                                                    <MenuItem onClick={handlePinComment} dense>
                                                        {selectedComment?.isPinned ? <PushPinOutlinedIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} /> : <PushPinIcon sx={{ fontSize: 16, mr: 1, color: 'text.secondary' }} />}
                                                        <Typography variant="caption">{selectedComment?.isPinned ? 'Unpin' : 'Pin'}</Typography>
                                                    </MenuItem>
                                                    {selectedComment?.user?._id === user?._id && (
                                                        <MenuItem onClick={handleDeleteComment} dense>
                                                            <DeleteIcon sx={{ fontSize: 16, mr: 1, color: 'error.main' }} />
                                                            <Typography variant="caption" color="error">Delete</Typography>
                                                        </MenuItem>
                                                    )}
                                                </Menu>
                                            </Box>
                                        ))
                                    )}
                                </Box>

                                <Box component="form" onSubmit={handleAddComment} sx={{ p: 1.5, bgcolor: 'background.paper', borderTop: '1px solid', borderColor: 'divider', position: 'relative' }}>
                                    {replyingTo && (
                                        <Box sx={{
                                            p: 1,
                                            mb: 1,
                                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            borderLeft: '3px solid',
                                            borderColor: 'primary.main',
                                            borderRadius: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>
                                            <Box>
                                                <Typography variant="caption" color="primary.main" fontWeight="bold">
                                                    Replying to {replyingTo.user?.name}
                                                </Typography>
                                                <Typography variant="body2" sx={{ fontSize: '0.75rem', color: 'text.secondary', maxHeight: 40, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                                                    {replyingTo.text}
                                                </Typography>
                                            </Box>
                                            <IconButton size="small" onClick={() => setReplyingTo(null)}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </Box>
                                    )}
                                    {mentionQuery !== null && filteredUsers.length > 0 && (
                                        <ClickAwayListener onClickAway={() => setMentionQuery(null)}>
                                            <Paper
                                                sx={{
                                                    position: 'absolute',
                                                    bottom: '100%',
                                                    left: 10,
                                                    width: 280,
                                                    maxHeight: 220,
                                                    overflowY: 'auto',
                                                    mb: 1,
                                                    zIndex: 10,
                                                    boxShadow: theme.shadows[4],
                                                }}
                                            >
                                                <Box
                                                    sx={{
                                                        px: 2,
                                                        py: 1,
                                                        borderBottom: '1px solid',
                                                        borderColor: 'divider',
                                                        bgcolor: 'background.paper',
                                                    }}
                                                >
                                                    <Typography
                                                        variant="caption"
                                                        sx={{ fontWeight: 600, color: 'text.secondary', letterSpacing: 0.5 }}
                                                    >
                                                        Suggestions
                                                    </Typography>
                                                </Box>

                                                <List dense disablePadding>
                                                    {filteredUsers.map(user => (
                                                        <ListItem key={user._id} disablePadding>
                                                            <ListItemButton
                                                                onClick={() => insertMention(user)}
                                                                sx={{ px: 2, '&:hover': { bgcolor: 'action.hover' } }}
                                                            >
                                                                <ListItemAvatar>
                                                                    <Avatar
                                                                        src={user.isSpecial ? undefined : user.profilePicture}
                                                                        alt={user.name}
                                                                        sx={{ width: 28, height: 28, bgcolor: user.isSpecial ? 'transparent' : 'grey.300' }}
                                                                    >
                                                                        {user.isSpecial ? <GroupsIcon sx={{ fontSize: 20, color: 'text.secondary' }} /> : user.name?.[0]}
                                                                    </Avatar>
                                                                </ListItemAvatar>

                                                                <ListItemText
                                                                    primary={user.name}
                                                                    secondary={user.type}
                                                                    primaryTypographyProps={{
                                                                        variant: 'body2',
                                                                        fontWeight: 500,
                                                                    }}
                                                                    secondaryTypographyProps={{
                                                                        variant: 'caption',
                                                                        color: 'text.secondary',
                                                                    }}
                                                                />
                                                            </ListItemButton>
                                                        </ListItem>
                                                    ))}
                                                </List>
                                            </Paper>
                                        </ClickAwayListener>
                                    )}
                                    <TextField
                                        fullWidth
                                        inputRef={inputRef}
                                        placeholder="Type a message..."
                                        variant="outlined"
                                        size="small"
                                        value={newComment}
                                        onChange={handleCommentChange}
                                        InputProps={{
                                            sx: { borderRadius: 2, fontSize: '0.85rem', bgcolor: 'background.default', '& fieldset': { border: 'none' } },
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <IconButton size="small" type="submit" color="primary" disabled={!newComment.trim() || isCommentLoading}>
                                                        {isCommentLoading ? <CircularProgress size={20} /> : <SendIcon fontSize="small" />}
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Box>
                            </Paper>

                            {/* Resources Section */}
                            <Paper
                                elevation={0}
                                sx={{
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 3,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    overflow: 'hidden',
                                    flexShrink: 0
                                }}
                            >
                                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LinkIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
                                    <Typography variant="subtitle2" fontWeight="bold" color="text.primary">Resources</Typography>
                                </Box>

                                <Box sx={{ p: 1, overflowY: 'auto', maxHeight: 200 }}>
                                    {selectedTask.links?.length === 0 ? (
                                        <EmptyState
                                            title="No links"
                                            description="No links have been added yet."
                                            icon={LinkIcon}
                                            height="100%"
                                        />
                                    ) : (
                                        selectedTask.links?.map((link, idx) => (
                                            <Box
                                                key={idx}
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    p: 1.5,
                                                    m: 0.5,
                                                    bgcolor: 'background.default',
                                                    borderRadius: 2,
                                                    border: '1px solid',
                                                    borderColor: 'divider',
                                                    '&:hover .actions': { opacity: 1 }
                                                }}
                                            >
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden' }}>
                                                    <LaunchIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                    <Typography variant="body2" noWrap sx={{ fontSize: '0.8rem', fontWeight: 500, color: 'text.primary' }}>
                                                        {link.title}
                                                    </Typography>
                                                </Box>
                                                <Box className="actions" sx={{ opacity: 0, transition: 'opacity 0.2s', display: 'flex' }}>
                                                    <Tooltip title="Open Link" placement="top" arrow>
                                                        <IconButton size="small" href={link.url} target="_blank" color="primary">
                                                            <LaunchIcon fontSize="small" sx={{ fontSize: 14 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Delete Link" placement="top" arrow>
                                                        <IconButton size="small" onClick={() => handleDeleteLink(link)} color="error">
                                                            <DeleteIcon fontSize="small" sx={{ fontSize: 14 }} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </Box>
                                        ))
                                    )}
                                </Box>

                                <Box component="form" onSubmit={handleAddLink} sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                                    <TextField
                                        fullWidth
                                        placeholder="Link Name"
                                        variant="outlined"
                                        size="small"
                                        value={newLinkTitle}
                                        onChange={(e) => setNewLinkTitle(e.target.value)}
                                        sx={{ mb: 1, '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.8rem', bgcolor: 'background.default' } }}
                                    />
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <TextField
                                            fullWidth
                                            placeholder="URL"
                                            variant="outlined"
                                            size="small"
                                            value={newLinkUrl}
                                            onChange={(e) => setNewLinkUrl(e.target.value)}
                                            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2, fontSize: '0.8rem', bgcolor: 'background.default' } }}
                                        />
                                        <Button
                                            type="submit"
                                            variant="outlined"
                                            color="secondary"
                                            disabled={!newLinkTitle || !newLinkUrl || isLinkLoading}
                                            sx={{ borderRadius: 2, minWidth: 'auto', px: 2 }}
                                        >
                                            {isLinkLoading ? <CircularProgress size={20} color="inherit" /> : <AddIcon fontSize="small" />}
                                        </Button>
                                    </Box>
                                </Box>
                            </Paper>
                        </OffcanvasBody>
                    </>
                )}
            </Offcanvas>

            <Menu
                anchorEl={taskMenuAnchorEl}
                open={Boolean(taskMenuAnchorEl)}
                onClose={handleTaskMenuClose}
                PaperProps={{ elevation: 3, sx: { borderRadius: 2, minWidth: 150 } }}
            >
                <MenuItem disabled dense>
                    <Typography variant="caption" fontWeight="bold">Move to...</Typography>
                </MenuItem>
                {['To Do', 'In Progress', 'Done']
                    .filter(status => status !== activeMenuTask?.status)
                    .map(status => (
                        <MenuItem key={status} onClick={() => handleMoveTask(status)} dense>
                            <Typography variant="body2">{status}</Typography>
                        </MenuItem>
                    ))
                }
            </Menu>
        </Container>
    );
};

export default Board;
