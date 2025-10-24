import CourseModal from '@/components/CourseModal';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

// Helper pour obtenir les 7 jours d'une semaine (commence lundi)
function getWeekDates(date: Date) {
  const dayOfWeek = date.getDay();
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  
  const monday = new Date(date);
  monday.setDate(date.getDate() + diff);
  
  const week = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    week.push(d);
  }
  return week;
}

export default function AcademiqueScreen() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('emploi');
  const [todoFilter, setTodoFilter] = useState('all');
  const [notesFilter, setNotesFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today); // Date pour la navigation
  const weekDates = getWeekDates(currentDate);
  const [selectedDate, setSelectedDate] = useState(today);
  
  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const dayLabels = ['LUN', 'MAR', 'MER', 'JEU', 'VEN', 'SAM', 'DIM'];

  // Calculer le mois affiché (peut être 2 mois si la semaine traverse)
  const getDisplayMonth = () => {
    const firstDate = weekDates[0];
    const lastDate = weekDates[6];
    
    if (firstDate.getMonth() === lastDate.getMonth()) {
      return `${monthNames[firstDate.getMonth()]} ${firstDate.getFullYear()}`;
    } else {
      return `${monthNames[firstDate.getMonth()]} - ${monthNames[lastDate.getMonth()]} ${firstDate.getFullYear()}`;
    }
  };

  const displayMonth = getDisplayMonth();

  // Charger les cours depuis Supabase
  const loadCourses = async () => {
    if (!user) return;

    setLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: true });

    setLoading(false);

    if (error) {
      console.error('Erreur chargement cours:', error);
    } else {
      setCourses(data || []);
    }
  };

  useEffect(() => {
    loadCourses();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCourses();
    setRefreshing(false);
  };

  // Navigation semaines
  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(today);
    setSelectedDate(today);
  };

  // Vérifier si un jour a des cours
  const hasCourses = (dayOfWeek: number) => {
    return courses.some(course => course.day_of_week === dayOfWeek);
  };

  // Obtenir les cours d'un jour spécifique
  const getCoursesByDay = (dayOfWeek: number) => {
    return courses.filter(course => course.day_of_week === dayOfWeek);
  };

  // Cours du jour sélectionné
  const selectedDayOfWeek = selectedDate.getDay();
  const selectedDayCourses = getCoursesByDay(selectedDayOfWeek);

  // Label pour la section (Aujourd'hui ou Jour + Date)
  const getSectionLabel = () => {
    if (selectedDate.toDateString() === today.toDateString()) {
      return "Aujourd'hui";
    }
    const dayIndex = weekDates.findIndex(d => d.toDateString() === selectedDate.toDateString());
    if (dayIndex >= 0) {
      return `${dayLabels[dayIndex]} ${selectedDate.getDate()}`;
    }
    return "Cours";
  };

  const handleCoursePress = (course: any) => {
    setSelectedCourse(course);
    setModalVisible(true);
  };

  const handleAddCourse = () => {
    setSelectedCourse(null);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setSelectedCourse(null);
  };

  const handleModalSave = () => {
    loadCourses();
  };

  const todoTasks = [
    {
      id: 1,
      title: 'Rendu projet UX Design',
      course: 'Design Thinking',
      deadline: 'Demain 23h59',
      priority: 'urgent',
      completed: false,
    },
    {
      id: 2,
      title: 'Lire chapitre 5 - Marketing',
      course: 'Marketing Digital',
      deadline: 'Vendredi 18h00',
      priority: 'normal',
      completed: false,
    },
    {
      id: 3,
      title: 'Préparer présentation',
      course: 'Communication',
      deadline: 'Lundi prochain',
      priority: 'normal',
      completed: true,
    },
  ];

  const notes = [
    {
      id: 1,
      title: 'Cours Marketing Digital - Chapitre 3',
      type: 'scanned',
      date: 'Il y a 2 heures',
      pages: 8,
      hasAiSummary: true,
    },
    {
      id: 2,
      title: 'Notes Data Analytics - Statistiques',
      type: 'shared',
      date: 'Hier',
      pages: 12,
      hasAiSummary: false,
      sharedBy: 'Marie L.',
    },
  ];

  const filteredTodos = todoTasks.filter(task => {
    if (todoFilter === 'urgent') return task.priority === 'urgent' && !task.completed;
    if (todoFilter === 'week') return !task.completed;
    return true;
  });

  const filteredNotes = notes.filter(note => {
    if (notesFilter === 'scanned') return note.type === 'scanned';
    if (notesFilter === 'shared') return note.type === 'shared';
    if (notesFilter === 'ai') return note.hasAiSummary;
    return true;
  });

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <LinearGradient 
        colors={['#1a1b2e', '#16213e', '#23243b']}
        style={styles.background}
        start={{x: 0, y: 0}}
        end={{x: 0, y: 1}}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Académique</Text>
          <TouchableOpacity 
            style={styles.addButton}
            onPress={handleAddCourse}
            activeOpacity={0.7}
          >
            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
              <Path d="M12 5v14M5 12h14" stroke="#7566d9" strokeWidth={2.5} strokeLinecap="round"/>
            </Svg>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('emploi')}
            style={[styles.tab, activeTab === 'emploi' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'emploi' && styles.tabTextActive]}>
              Emploi du temps
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('todo')}
            style={[styles.tab, activeTab === 'todo' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'todo' && styles.tabTextActive]}>
              To-Do
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('notes')}
            style={[styles.tab, activeTab === 'notes' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === 'notes' && styles.tabTextActive]}>
              Notes
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scroll} 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#7566d9" />
          }
        >
          {/* TAB EMPLOI DU TEMPS */}
          {activeTab === 'emploi' && (
            <>
              {/* Navigation semaine */}
              <View style={styles.weekNav}>
                <TouchableOpacity 
                  style={styles.weekArrow}
                  onPress={goToPreviousWeek}
                  activeOpacity={0.7}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M15 18l-6-6 6-6" stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </TouchableOpacity>

                <View style={styles.weekCenter}>
                  <Text style={styles.monthText}>{displayMonth}</Text>
                  {currentDate.toDateString() !== today.toDateString() && (
                    <TouchableOpacity onPress={goToToday} style={styles.todayButton}>
                      <Text style={styles.todayButtonText}>Aujourd'hui</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity 
                  style={styles.weekArrow}
                  onPress={goToNextWeek}
                  activeOpacity={0.7}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </TouchableOpacity>
              </View>

              {/* Calendrier - 7 jours en ligne */}
              <View style={styles.calendarRow}>
                {weekDates.map((date, index) => {
                  const dayOfWeek = date.getDay();
                  const isToday = date.toDateString() === today.toDateString();
                  const isSelected = date.toDateString() === selectedDate.toDateString();
                  const dayHasCourses = hasCourses(dayOfWeek);
                  
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.dayButton,
                        isToday && styles.dayButtonToday,
                        isSelected && styles.dayButtonSelected,
                      ]}
                      onPress={() => setSelectedDate(date)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.dayLabel,
                        isToday && styles.dayLabelToday,
                        isSelected && styles.dayLabelSelected,
                      ]}>
                        {dayLabels[index]}
                      </Text>
                      <Text style={[
                        styles.dayNumber,
                        isToday && styles.dayNumberToday,
                        isSelected && styles.dayNumberSelected,
                      ]}>
                        {date.getDate()}
                      </Text>
                      {dayHasCourses && (
                        <View style={[
                          styles.dayDot,
                          isSelected && styles.dayDotSelected,
                        ]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Section Cours du jour sélectionné - AVEC ENCADRÉ */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <LinearGradient
                    colors={['rgba(117, 102, 217, 0.15)', 'rgba(117, 102, 217, 0.05)']}
                    style={styles.sectionHeaderGradient}
                    start={{x: 0, y: 0}}
                    end={{x: 1, y: 0}}
                  >
                    <Text style={styles.sectionTitle}>{getSectionLabel()}</Text>
                  </LinearGradient>
                </View>
                
                {selectedDayCourses.length > 0 ? (
                  selectedDayCourses.map((course) => (
                    <TouchableOpacity key={course.id} activeOpacity={0.7} onPress={() => handleCoursePress(course)}>
                      <View style={styles.courseCard}>
                        <LinearGradient
                          colors={['rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0.01)']}
                          style={styles.courseGradient}
                        >
                          <View style={[styles.courseAccent, { backgroundColor: course.color }]} />
                          <View style={styles.courseContent}>
                            <View style={styles.courseHeader}>
                              <View style={styles.courseTime}>
                                <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                  <Circle cx={12} cy={12} r={10} stroke="rgba(255,255,255,0.4)" strokeWidth={2}/>
                                  <Path d="M12 6v6l4 2" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round"/>
                                </Svg>
                                <Text style={styles.courseTimeText}>
                                  {course.start_time.slice(0, 5)} - {course.end_time.slice(0, 5)}
                                </Text>
                              </View>
                            </View>
                            <Text style={styles.courseTitle}>{course.title}</Text>
                            <View style={styles.courseDetails}>
                              {course.location && (
                                <View style={styles.courseDetail}>
                                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                    <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="rgba(255,255,255,0.5)" strokeWidth={2}/>
                                    <Circle cx={12} cy={10} r={3} stroke="rgba(255,255,255,0.5)" strokeWidth={2}/>
                                  </Svg>
                                  <Text style={styles.courseDetailText}>{course.location}</Text>
                                </View>
                              )}
                              {course.professor && (
                                <View style={styles.courseDetail}>
                                  <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                    <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                                    <Circle cx={12} cy={7} r={4} stroke="rgba(255,255,255,0.5)" strokeWidth={2}/>
                                  </Svg>
                                  <Text style={styles.courseDetailText}>{course.professor}</Text>
                                </View>
                              )}
                            </View>
                          </View>
                        </LinearGradient>
                      </View>
                    </TouchableOpacity>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Aucun cours ce jour</Text>
                    <TouchableOpacity onPress={handleAddCourse} style={styles.emptyButton}>
                      <Text style={styles.emptyButtonText}>Ajouter un cours</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              <View style={{height: 40}} />
            </>
          )}

          {/* TAB TO-DO */}
          {activeTab === 'todo' && (
            <>
              <View style={styles.filtersContainer}>
                <TouchableOpacity
                  style={[styles.filterChip, todoFilter === 'all' && styles.filterChipActive]}
                  onPress={() => setTodoFilter('all')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterText, todoFilter === 'all' && styles.filterTextActive]}>
                    Toutes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, todoFilter === 'urgent' && styles.filterChipActive]}
                  onPress={() => setTodoFilter('urgent')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterText, todoFilter === 'urgent' && styles.filterTextActive]}>
                    Urgentes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, todoFilter === 'week' && styles.filterChipActive]}
                  onPress={() => setTodoFilter('week')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterText, todoFilter === 'week' && styles.filterTextActive]}>
                    Cette semaine
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                {filteredTodos.map((task) => (
                  <TouchableOpacity key={task.id} activeOpacity={0.7}>
                    <View style={styles.todoCard}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0.01)']}
                        style={styles.todoGradient}
                      >
                        <View style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
                          {task.completed && (
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                              <Path d="M20 6L9 17l-5-5" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/>
                            </Svg>
                          )}
                        </View>
                        <View style={styles.todoContent}>
                          <View style={styles.todoHeader}>
                            <Text style={[styles.todoTitle, task.completed && styles.todoTitleCompleted]}>
                              {task.title}
                            </Text>
                            {task.priority === 'urgent' && !task.completed && (
                              <View style={styles.urgentBadge}>
                                <Text style={styles.urgentText}>URGENT</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.todoCourse}>{task.course}</Text>
                          <Text style={styles.todoDeadline}>{task.deadline}</Text>
                        </View>
                      </LinearGradient>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {/* TAB NOTES */}
          {activeTab === 'notes' && (
            <>
              <View style={styles.filtersContainer}>
                <TouchableOpacity
                  style={[styles.filterChip, notesFilter === 'all' && styles.filterChipActive]}
                  onPress={() => setNotesFilter('all')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterText, notesFilter === 'all' && styles.filterTextActive]}>
                    Toutes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, notesFilter === 'scanned' && styles.filterChipActive]}
                  onPress={() => setNotesFilter('scanned')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterText, notesFilter === 'scanned' && styles.filterTextActive]}>
                    Scannées
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, notesFilter === 'ai' && styles.filterChipActive]}
                  onPress={() => setNotesFilter('ai')}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.filterText, notesFilter === 'ai' && styles.filterTextActive]}>
                    Résumé IA
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                {filteredNotes.map((note) => (
                  <TouchableOpacity key={note.id} activeOpacity={0.7}>
                    <View style={styles.noteCard}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.04)', 'rgba(255, 255, 255, 0.01)']}
                        style={styles.noteGradient}
                      >
                        <View style={styles.noteIcon}>
                          <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
                            <Path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#7566d9" strokeWidth={2}/>
                            <Path d="M14 2v6h6" stroke="#7566d9" strokeWidth={2}/>
                          </Svg>
                        </View>
                        <View style={styles.noteContent}>
                          <Text style={styles.noteTitle}>{note.title}</Text>
                          <Text style={styles.noteDate}>{note.date} · {note.pages} pages</Text>
                          {note.sharedBy && (
                            <Text style={styles.noteShared}>Partagé par {note.sharedBy}</Text>
                          )}
                        </View>
                        {note.hasAiSummary && (
                          <View style={styles.aiBadge}>
                            <Text style={styles.aiText}>IA</Text>
                          </View>
                        )}
                      </LinearGradient>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </LinearGradient>

      {/* Modal Ajouter/Modifier cours */}
      <CourseModal
        visible={modalVisible}
        onClose={handleModalClose}
        onSave={handleModalSave}
        courseToEdit={selectedCourse}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '800',
    color: '#ffffff',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(117, 102, 217, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(117, 102, 217, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 24,
    gap: 10,
  },
  tab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  tabActive: {
    backgroundColor: 'rgba(117, 102, 217, 0.25)',
    borderColor: 'rgba(117, 102, 217, 0.4)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  tabTextActive: {
    color: '#ffffff',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  weekArrow: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekCenter: {
    alignItems: 'center',
  },
  monthText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 6,
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(117, 102, 217, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(117, 102, 217, 0.3)',
  },
  todayButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7566d9',
  },
  calendarRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 28,
    justifyContent: 'space-between',
  },
  dayButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    minWidth: 48,
  },
  dayButtonToday: {
    backgroundColor: 'rgba(117, 102, 217, 0.15)',
    borderColor: 'rgba(117, 102, 217, 0.3)',
  },
  dayButtonSelected: {
    backgroundColor: 'rgba(117, 102, 217, 0.25)',
    borderColor: 'rgba(117, 102, 217, 0.5)',
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 6,
  },
  dayLabelToday: {
    color: '#7566d9',
  },
  dayLabelSelected: {
    color: '#ffffff',
  },
  dayNumber: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  dayNumberToday: {
    color: '#7566d9',
  },
  dayNumberSelected: {
    color: '#ffffff',
  },
  dayDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: 'rgba(117, 102, 217, 0.6)',
    marginTop: 6,
  },
  dayDotSelected: {
    backgroundColor: '#ffffff',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    marginBottom: 16,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(117, 102, 217, 0.2)',
  },
  sectionHeaderGradient: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  courseCard: {
    marginBottom: 12,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  courseGradient: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  courseAccent: {
    width: 4,
    borderRadius: 2,
    marginRight: 14,
    alignSelf: 'stretch',
  },
  courseContent: {
    flex: 1,
  },
  courseHeader: {
    marginBottom: 8,
  },
  courseTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courseTimeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  courseTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 10,
  },
  courseDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  courseDetail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  courseDetailText: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 16,
  },
  emptyButton: {
    backgroundColor: 'rgba(117, 102, 217, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(117, 102, 217, 0.3)',
  },
  emptyButtonText: {
    color: '#7566d9',
    fontSize: 14,
    fontWeight: '700',
  },
  // TO-DO
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(117, 102, 217, 0.25)',
    borderColor: 'rgba(117, 102, 217, 0.4)',
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  filterTextActive: {
    color: '#ffffff',
  },
  todoCard: {
    marginBottom: 12,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  todoGradient: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
    gap: 14,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#7566d9',
    borderColor: '#7566d9',
  },
  todoContent: {
    flex: 1,
  },
  todoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  todoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
    flex: 1,
  },
  todoTitleCompleted: {
    textDecorationLine: 'line-through',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  urgentBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  urgentText: {
    color: '#ef4444',
    fontSize: 10,
    fontWeight: '800',
  },
  todoCourse: {
    fontSize: 13,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  todoDeadline: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  // NOTES
  noteCard: {
    marginBottom: 12,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  noteGradient: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    gap: 14,
  },
  noteIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(117, 102, 217, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(117, 102, 217, 0.2)',
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 6,
  },
  noteDate: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.5)',
  },
  noteShared: {
    fontSize: 11,
    fontWeight: '600',
    color: 'rgba(117, 102, 217, 0.8)',
    marginTop: 4,
  },
  aiBadge: {
    backgroundColor: 'rgba(117, 102, 217, 0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(117, 102, 217, 0.3)',
  },
  aiText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
});