
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TASKS_KEY = '@skillgap_tasks';

type Priority = 'High' | 'Medium' | 'Low';
type Filter = 'All' | 'Pending' | 'Completed';

type Task = {
  id: string;
  title: string;
  dueDate: string;
  priority: Priority;
  completed: boolean;
};

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [taskTitle, setTaskTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [filter, setFilter] = useState<Filter>('All');
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadTasks() {
      try {
        const stored = await AsyncStorage.getItem(TASKS_KEY);

        if (stored) {
          const parsed: unknown = JSON.parse(stored);

          if (Array.isArray(parsed)) {
            setTasks(parsed as Task[]);
          }
        }
      } catch {
        Alert.alert(
          'Unable to load tasks',
          'Your saved tasks could not be loaded.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  useEffect(() => {
    if (!saved) return;

    async function saveTasks() {
      try {
        await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
      } catch {
        Alert.alert(
          'Unable to save tasks',
          'Please try again. Your latest changes may not have been saved.'
        );
      }
    }

    saveTasks();
  }, [tasks, saved]);

  function addTask() {
    const title = taskTitle.trim();

    if (!title) {
      Alert.alert('Task title required', 'Enter what you want to learn.');
      return;
    }

    if (dueDate.trim() && !/^\d{4}-\d{2}-\d{2}$/.test(dueDate.trim())) {
      Alert.alert(
        'Invalid date format',
        'Enter the date as YYYY-MM-DD, for example 2026-11-15.'
      );
      return;
    }

    const newTask: Task = {
      id: `${Date.now()}-${Math.random()}`,
      title,
      dueDate: dueDate.trim(),
      priority,
      completed: false,
    };

    setSaved(true);
    setTasks((current) => [newTask, ...current]);
    setTaskTitle('');
    setDueDate('');
    setPriority('Medium');
    Keyboard.dismiss();
  }

  function toggleTask(id: string) {
    setSaved(true);
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  }

  function deleteTask(id: string) {
    Alert.alert('Delete task?', 'This task will be permanently removed.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setSaved(true);
          setTasks((current) => current.filter((task) => task.id !== id));
        },
      },
    ]);
  }

  const completedCount = tasks.filter((task) => task.completed).length;
  const pendingCount = tasks.length - completedCount;
  const progress =
    tasks.length === 0 ? 0 : Math.round((completedCount / tasks.length) * 100);

  const visibleTasks = tasks.filter((task) => {
    if (filter === 'Pending') return !task.completed;
    if (filter === 'Completed') return task.completed;
    return true;
  });

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.muted}>Loading your tasks...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>YOUR LEARNING JOURNEY</Text>
        <Text style={styles.title}>My Tasks</Text>
        <Text style={styles.description}>
          Small steps every day bring you closer to your dream role.
        </Text>

        <View style={styles.progressCard}>
          <View style={styles.progressHeader}>
            <View>
              <Text style={styles.progressTitle}>Your progress</Text>
              <Text style={styles.progressSubtitle}>
                {completedCount} of {tasks.length} tasks completed
              </Text>
            </View>
            <View style={styles.percentageCircle}>
              <Text style={styles.percentageText}>{progress}%</Text>
            </View>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{tasks.length}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{pendingCount}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{completedCount}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Add a learning task</Text>
          <Text style={styles.label}>What do you want to learn?</Text>

          <TextInput
            style={styles.input}
            value={taskTitle}
            onChangeText={setTaskTitle}
            placeholder="e.g. Practice Java arrays"
            placeholderTextColor="#94A3B8"
            returnKeyType="done"
            onSubmitEditing={addTask}
            maxLength={120}
          />

          <Text style={styles.label}>Due date (optional)</Text>
          <TextInput
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#94A3B8"
            keyboardType="numbers-and-punctuation"
            maxLength={10}
          />

          <Text style={styles.label}>Priority</Text>
          <View style={styles.priorityRow}>
            {(['High', 'Medium', 'Low'] as Priority[]).map((item) => (
              <Pressable
                key={item}
                onPress={() => setPriority(item)}
                style={[
                  styles.priorityButton,
                  priority === item && styles.prioritySelected,
                  priority === item &&
                    item === 'High' &&
                    styles.highSelected,
                  priority === item &&
                    item === 'Medium' &&
                    styles.mediumSelected,
                  priority === item &&
                    item === 'Low' &&
                    styles.lowSelected,
                ]}
              >
                <Text
                  style={[
                    styles.priorityText,
                    priority === item && styles.priorityTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.addButton} onPress={addTask}>
            <Text style={styles.addButtonText}>＋  Add Task</Text>
          </Pressable>
        </View>

        <View style={styles.taskHeader}>
          <View>
            <Text style={styles.sectionTitle}>Your learning plan</Text>
            <Text style={styles.muted}>
              Keep going, one task at a time.
            </Text>
          </View>
        </View>

        <View style={styles.filterRow}>
          {(['All', 'Pending', 'Completed'] as Filter[]).map((item) => (
            <Pressable
              key={item}
              onPress={() => setFilter(item)}
              style={[
                styles.filterButton,
                filter === item && styles.filterSelected,
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  filter === item && styles.filterTextSelected,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>

        {visibleTasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>
              {filter === 'Completed' ? '✓' : '＋'}
            </Text>
            <Text style={styles.emptyTitle}>
              {filter === 'Completed'
                ? 'No completed tasks yet'
                : filter === 'Pending'
                  ? 'All caught up!'
                  : 'Your learning plan starts here'}
            </Text>
            <Text style={styles.emptyDescription}>
              {filter === 'Completed'
                ? 'Complete a task and it will appear here.'
                : filter === 'Pending'
                  ? 'You have no pending tasks. Great work!'
                  : 'Add your first task above and start building your skills.'}
            </Text>
          </View>
        ) : (
          visibleTasks.map((task) => (
            <View
              key={task.id}
              style={[
                styles.taskCard,
                task.completed && styles.completedTaskCard,
              ]}
            >
              <Pressable
                onPress={() => toggleTask(task.id)}
                style={[
                  styles.checkbox,
                  task.completed && styles.checkboxChecked,
                ]}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: task.completed }}
                accessibilityLabel={`Mark ${task.title} ${
                  task.completed ? 'incomplete' : 'complete'
                }`}
              >
                {task.completed && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </Pressable>

              <View style={styles.taskDetails}>
                <Text
                  style={[
                    styles.taskTitle,
                    task.completed && styles.taskTitleCompleted,
                  ]}
                >
                  {task.title}
                </Text>

                <View style={styles.taskMeta}>
                  <View
                    style={[
                      styles.priorityBadge,
                      task.priority === 'High' && styles.highBadge,
                      task.priority === 'Medium' && styles.mediumBadge,
                      task.priority === 'Low' && styles.lowBadge,
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityBadgeText,
                        task.priority === 'High' && styles.highBadgeText,
                        task.priority === 'Medium' &&
                          styles.mediumBadgeText,
                        task.priority === 'Low' && styles.lowBadgeText,
                      ]}
                    >
                      {task.priority}
                    </Text>
                  </View>

                  {task.dueDate ? (
                    <Text style={styles.dueDate}>Due {task.dueDate}</Text>
                  ) : null}
                </View>
              </View>

              <Pressable
                onPress={() => deleteTask(task.id)}
                style={styles.deleteButton}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${task.title}`}
              >
                <Text style={styles.deleteText}>×</Text>
              </Pressable>
            </View>
          ))
        )}

        <Text style={styles.footer}>SkillGap • Keep learning, keep growing</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  eyebrow: {
    color: '#2563EB',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginBottom: 7,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#172554',
  },
  description: {
    marginTop: 8,
    marginBottom: 22,
    fontSize: 14,
    lineHeight: 22,
    color: '#64748B',
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    marginBottom: 20,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#172554',
  },
  progressSubtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 5,
  },
  percentageCircle: {
    width: 57,
    height: 57,
    borderRadius: 29,
    backgroundColor: '#EFF6FF',
    borderWidth: 2,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  progressTrack: {
    height: 9,
    borderRadius: 5,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    marginTop: 20,
  },
  progressFill: {
    height: '100%',
    borderRadius: 5,
    backgroundColor: '#2563EB',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 19,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#172554',
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  statDivider: {
    height: 35,
    width: 1,
    backgroundColor: '#E2E8F0',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#172554',
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 17,
    marginBottom: 8,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 11,
    paddingHorizontal: 13,
    paddingVertical: 11,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 9,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 11,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
  },
  prioritySelected: {
    borderWidth: 1.5,
  },
  highSelected: {
    backgroundColor: '#FFF1F2',
    borderColor: '#FDA4AF',
  },
  mediumSelected: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FCD34D',
  },
  lowSelected: {
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
  },
  priorityText: {
    color: '#64748B',
    fontSize: 13,
    fontWeight: '600',
  },
  priorityTextSelected: {
    color: '#172554',
    fontWeight: '800',
  },
  addButton: {
    minHeight: 50,
    backgroundColor: '#2563EB',
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  taskHeader: {
    marginBottom: 14,
  },
  muted: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 19,
    marginTop: 5,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterSelected: {
    backgroundColor: '#DBEAFE',
    borderColor: '#93C5FD',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextSelected: {
    color: '#1D4ED8',
    fontWeight: '800',
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
    gap: 11,
  },
  completedTaskCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#D1FAE5',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  taskDetails: {
    flex: 1,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#172554',
    lineHeight: 20,
  },
  taskTitleCompleted: {
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  priorityBadge: {
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  highBadge: {
    backgroundColor: '#FFE4E6',
  },
  mediumBadge: {
    backgroundColor: '#FEF3C7',
  },
  lowBadge: {
    backgroundColor: '#D1FAE5',
  },
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  highBadgeText: {
    color: '#BE123C',
  },
  mediumBadgeText: {
    color: '#92400E',
  },
  lowBadgeText: {
    color: '#047857',
  },
  dueDate: {
    color: '#64748B',
    fontSize: 11,
  },
  deleteButton: {
    width: 30,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteText: {
    fontSize: 25,
    color: '#94A3B8',
    fontWeight: '400',
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 25,
    alignItems: 'center',
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
    textAlign: 'center',
    textAlignVertical: 'center',
    backgroundColor: '#EFF6FF',
    color: '#2563EB',
    fontSize: 27,
    fontWeight: '600',
    marginBottom: 13,
  },
  emptyTitle: {
    color: '#172554',
    fontSize: 15,
    fontWeight: '800',
    textAlign: 'center',
  },
  emptyDescription: {
    color: '#64748B',
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
    marginTop: 7,
  },
  footer: {
    textAlign: 'center',
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 24,
  },
});
