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
    ClickAwayListener
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
    Reply as ReplyIcon
} from '@mui/icons-material';
import api from '../api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const ENDPOINT = import.meta.env.VITE_SOCKET_URL;
var socket;

const Board = () => {
    const { user } = useAuth();
    const theme = useTheme();
    const [tasks, setTasks] = useState({
        'To Do': [],
        'In Progress': [],
        'Done': []
    });
    const [allTasksList, setAllTasksList] = useState([]);
    const [selectedTask, setSelectedTask] = useState(null);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [newLinkTitle, setNewLinkTitle] = useState('');
    const [newLinkUrl, setNewLinkUrl] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [mentionQuery, setMentionQuery] = useState(null);
    const [mentionCursorPos, setMentionCursorPos] = useState(null);
    const inputRef = useRef(null);
    const chatEndRef = useRef(null);

    useEffect(() => {
        socket = io(ENDPOINT);
        socket.emit("join", user?._id);
        fetchTasks();
        return () => {
            socket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

        socket.on("commentAdded", handleCommentAdded);
        socket.on("commentDeleted", handleCommentDeleted);

        return () => {
            socket.emit("leaveTask", selectedTask._id);
            socket.off("commentAdded", handleCommentAdded);
            socket.off("commentDeleted", handleCommentDeleted);
        };

    }, [selectedTask]);

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

        return Array.from(users.values());
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
        }
    };

    const handleDeleteLink = async (linkToDelete) => {
        if (!selectedTask) return;
        try {
            const res = await api.delete(`/tasks/${selectedTask._id}/links/${linkToDelete._id}`);
            const updatedTask = { ...selectedTask, links: res.data };
            updateLocalTask(updatedTask);
        } catch (error) {
            toast.error("Failed to delete link");
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
        <Container maxWidth="2xl" sx={{ py: 3, height: 'calc(100vh - 64px)' }}>
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
                <Grid size={{ xs: 12, lg: selectedTask ? 9 : 12 }} sx={{ height: '100%', overflow: 'hidden' }}>
                    <DragDropContext onDragEnd={onDragEnd}>
                        <Box sx={{
                            display: 'flex',
                            gap: 3,
                            height: '100%',
                            overflowX: 'auto',
                            pb: 1,
                            '& > div': {
                                flex: 1,
                                minWidth: '280px',
                            }
                        }}>
                            {['To Do', 'In Progress', 'Done'].map(columnId => (
                                <Box
                                    key={columnId}
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%',
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
                                                    border: '1px solid', borderColor: 'divider'
                                                }}
                                            >
                                                {tasks[columnId]?.map((task, index) => (
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
                                                                    borderColor: selectedTask?._id === task._id ? 'primary.main' : 'divider',
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
                                                                    <MoreHorizIcon fontSize="small" color="action" />
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
                                                ))}
                                                {provided.placeholder}
                                            </Box>
                                        )}
                                    </Droppable>
                                </Box>
                            ))}
                        </Box>
                    </DragDropContext>
                </Grid>

                {selectedTask && (
                    <Grid size={{ xs: 12, lg: 3 }} sx={{ height: '100%', overflow: 'hidden' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%' }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
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
                                <IconButton size="small" onClick={() => setSelectedTask(null)}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>

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
                                    minHeight: '40%'
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

                                <Box sx={{ flex: 1, overflowY: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {comments.length === 0 ? (
                                        <Typography variant="caption" color="text.secondary" textAlign="center" sx={{ mt: 2 }}>
                                            No comments yet.
                                        </Typography>
                                    ) : (
                                        comments.map((comment, idx) => (
                                            <Box key={idx} sx={{
                                                display: 'flex',
                                                gap: 1.5,
                                                flexDirection: comment.user?._id === user?._id ? 'row-reverse' : 'row'
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
                                                            <Tooltip title="Reply">
                                                                <IconButton
                                                                    className="reply-btn"
                                                                    size="small"
                                                                    sx={{
                                                                        padding: 0.2,
                                                                        opacity: 0,
                                                                        transition: 'opacity 0.2s',
                                                                        color: 'inherit'
                                                                    }}
                                                                    onClick={() => setReplyingTo(comment)}
                                                                >
                                                                    <ReplyIcon sx={{ fontSize: 14 }} />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Box>
                                                    </Box>
                                                    <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                                                        {renderCommentText(comment.text)}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        ))
                                    )}
                                    <div ref={chatEndRef} />
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
                                            <Paper sx={{
                                                position: 'absolute',
                                                bottom: '100%',
                                                left: 10,
                                                width: 250,
                                                maxHeight: 200,
                                                overflowY: 'auto',
                                                mb: 1,
                                                zIndex: 10,
                                                boxShadow: theme.shadows[4]
                                            }}>
                                                <List dense>
                                                    {filteredUsers.map(user => (
                                                        <ListItem key={user._id} disablePadding>
                                                            <ListItemButton
                                                                onClick={() => insertMention(user)}
                                                                sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                                                            >
                                                                <ListItemAvatar>
                                                                    <Avatar src={user.profilePicture} alt={user.name} sx={{ width: 24, height: 24 }}>
                                                                        {user.name?.[0]}
                                                                    </Avatar>
                                                                </ListItemAvatar>
                                                                <ListItemText
                                                                    primary={user.name}
                                                                    secondary={user.type}
                                                                    primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                                                                    secondaryTypographyProps={{ variant: 'caption' }}
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
                                                    <IconButton size="small" type="submit" color="primary" disabled={!newComment.trim()}>
                                                        <SendIcon fontSize="small" />
                                                    </IconButton>
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                </Box>
                            </Paper>

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
                                    maxHeight: '40%'
                                }}
                            >
                                <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <LinkIcon sx={{ fontSize: 18, color: 'secondary.main' }} />
                                    <Typography variant="subtitle2" fontWeight="bold" color="text.primary">Resources</Typography>
                                </Box>

                                <Box sx={{ p: 1, overflowY: 'auto', maxHeight: 200 }}>
                                    {selectedTask.links?.length === 0 ? (
                                        <Typography variant="caption" color="text.secondary" textAlign="center" display="block">
                                            No links added.
                                        </Typography>
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
                                            disabled={!newLinkTitle || !newLinkUrl}
                                            sx={{ borderRadius: 2, minWidth: 'auto', px: 2 }}
                                        >
                                            <AddIcon fontSize="small" />
                                        </Button>
                                    </Box>
                                </Box>
                            </Paper>
                        </Box>
                    </Grid>
                )}
            </Grid>
        </Container>
    );
};

export default Board;
