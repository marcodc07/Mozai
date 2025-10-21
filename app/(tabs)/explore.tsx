import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';

export default function AcademiqueScreen() {
  const [activeTab, setActiveTab] = useState('emploi');
  const [currentWeek, setCurrentWeek] = useState(42);
  const [todoFilter, setTodoFilter] = useState('all');
  const [notesFilter, setNotesFilter] = useState('all');
  
  const currentMonth = 'Octobre 2024';
  const todayWeek = 42;

  const weekDays = [
    { short: 'LUN', date: 14, hasCourses: true },
    { short: 'MAR', date: 15, hasCourses: true },
    { short: 'MER', date: 16, hasCourses: true },
    { short: 'JEU', date: 17, hasCourses: false },
    { short: 'VEN', date: 18, hasCourses: true },
    { short: 'SAM', date: 19, hasCourses: false },
    { short: 'DIM', date: 20, hasCourses: false },
  ];

  const todayCourses = [
    {
      time: '10h30 - 12h00',
      title: 'Marketing Digital',
      location: 'Amphi B',
      professor: 'Prof. Martin',
      color: 'rgba(117, 102, 217, 0.6)',
    },
    {
      time: '14h00 - 16h30',
      title: 'Data Analytics',
      location: 'Salle 204',
      professor: 'Prof. Dubois',
      color: 'rgba(167, 189, 217, 0.6)',
    },
  ];

  const tomorrowCourses = [
    {
      time: '17h00 - 18h30',
      title: "Communication d'Entreprise",
      location: 'En ligne',
      professor: 'Prof. Leroux',
      color: 'rgba(236, 72, 153, 0.6)',
    },
  ];

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
    {
      id: 4,
      title: 'Exercices Python',
      course: 'Programmation',
      deadline: 'Jeudi 16h00',
      priority: 'urgent',
      completed: false,
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
    {
      id: 3,
      title: 'Résumé Communication d\'Entreprise',
      type: 'ai',
      date: 'Il y a 3 jours',
      pages: 4,
      hasAiSummary: true,
    },
    {
      id: 4,
      title: 'TD Microéconomie - Exercices',
      type: 'scanned',
      date: 'Il y a 5 jours',
      pages: 6,
      hasAiSummary: false,
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
        >
          {/* TAB EMPLOI DU TEMPS */}
          {activeTab === 'emploi' && (
            <>
              <View style={styles.monthContainer}>
                <Text style={styles.monthText}>{currentMonth}</Text>
              </View>

              <View style={styles.weekNav}>
                <TouchableOpacity 
                  style={styles.weekArrow}
                  onPress={() => setCurrentWeek(currentWeek - 1)}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M15 18l-6-6 6-6" stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </TouchableOpacity>

                <View style={styles.weekCenter}>
                  <Text style={styles.weekText}>Semaine {currentWeek}</Text>
                  {currentWeek !== todayWeek && (
                    <TouchableOpacity 
                      style={styles.todayButton}
                      onPress={() => setCurrentWeek(todayWeek)}
                    >
                      <Text style={styles.todayButtonText}>Aujourd'hui</Text>
                    </TouchableOpacity>
                  )}
                </View>

                <TouchableOpacity 
                  style={styles.weekArrow}
                  onPress={() => setCurrentWeek(currentWeek + 1)}
                >
                  <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                    <Path d="M9 18l6-6-6-6" stroke="rgba(255,255,255,0.6)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                  </Svg>
                </TouchableOpacity>

                <TouchableOpacity style={styles.addButton}>
                  <LinearGradient
                    colors={['#7566d9', '#a7bdd9']}
                    style={styles.addGradient}
                  >
                    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                      <Path d="M12 5v14M5 12h14" stroke="#ffffff" strokeWidth={2.5} strokeLinecap="round"/>
                    </Svg>
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.weekCalendar}>
                {weekDays.map((day, index) => (
                  <View key={index} style={styles.dayColumn}>
                    <Text style={styles.dayLabel}>{day.short}</Text>
                    <View style={[styles.dayCircle, index === 2 && styles.dayCircleActive]}>
                      <Text style={[styles.dayNumber, index === 2 && styles.dayNumberActive]}>
                        {day.date}
                      </Text>
                    </View>
                    {day.hasCourses && (
                      <View style={styles.dayDots}>
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                      </View>
                    )}
                  </View>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Aujourd'hui</Text>
                {todayCourses.map((course, index) => (
                  <TouchableOpacity key={index} activeOpacity={0.7}>
                    <View style={styles.courseCard}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
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
                              <Text style={styles.courseTimeText}>{course.time}</Text>
                            </View>
                          </View>
                          <Text style={styles.courseTitle}>{course.title}</Text>
                          <View style={styles.courseDetails}>
                            <View style={styles.courseDetail}>
                              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                              </Svg>
                              <Text style={styles.courseDetailText}>{course.location}</Text>
                            </View>
                            <View style={styles.courseDetail}>
                              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                                <Circle cx={12} cy={7} r={4} stroke="rgba(255,255,255,0.5)" strokeWidth={2}/>
                              </Svg>
                              <Text style={styles.courseDetailText}>{course.professor}</Text>
                            </View>
                          </View>
                        </View>
                      </LinearGradient>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Demain</Text>
                {tomorrowCourses.map((course, index) => (
                  <TouchableOpacity key={index} activeOpacity={0.7}>
                    <View style={styles.courseCard}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
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
                              <Text style={styles.courseTimeText}>{course.time}</Text>
                            </View>
                          </View>
                          <Text style={styles.courseTitle}>{course.title}</Text>
                          <View style={styles.courseDetails}>
                            <View style={styles.courseDetail}>
                              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="rgba(255,255,255,0.5)" strokeWidth={2}/>
                                <Circle cx={12} cy={10} r={3} stroke="rgba(255,255,255,0.5)" strokeWidth={2}/>
                              </Svg>
                              <Text style={styles.courseDetailText}>{course.location}</Text>
                            </View>
                            <View style={styles.courseDetail}>
                              <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                                <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="rgba(255,255,255,0.5)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                                <Circle cx={12} cy={7} r={4} stroke="rgba(255,255,255,0.5)" strokeWidth={2}/>
                              </Svg>
                              <Text style={styles.courseDetailText}>{course.professor}</Text>
                            </View>
                          </View>
                        </View>
                      </LinearGradient>
                    </View>
                  </TouchableOpacity>
                ))}
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
                >
                  <Text style={[styles.filterText, todoFilter === 'all' && styles.filterTextActive]}>
                    Toutes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, todoFilter === 'urgent' && styles.filterChipActive]}
                  onPress={() => setTodoFilter('urgent')}
                >
                  <Text style={[styles.filterText, todoFilter === 'urgent' && styles.filterTextActive]}>
                    Urgentes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, todoFilter === 'week' && styles.filterChipActive]}
                  onPress={() => setTodoFilter('week')}
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
                        colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                        style={styles.todoGradient}
                      >
                        <TouchableOpacity style={[styles.checkbox, task.completed && styles.checkboxChecked]}>
                          {task.completed && (
                            <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
                              <Path d="M20 6L9 17l-5-5" stroke="#ffffff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/>
                            </Svg>
                          )}
                        </TouchableOpacity>
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
                          <View style={styles.todoFooter}>
                            <Svg width={14} height={14} viewBox="0 0 24 24" fill="none">
                              <Circle cx={12} cy={12} r={10} stroke="rgba(255,255,255,0.4)" strokeWidth={2}/>
                              <Path d="M12 6v6l4 2" stroke="rgba(255,255,255,0.4)" strokeWidth={2} strokeLinecap="round"/>
                            </Svg>
                            <Text style={styles.todoDeadline}>{task.deadline}</Text>
                          </View>
                        </View>
                      </LinearGradient>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{height: 40}} />
            </>
          )}

          {/* TAB NOTES */}
          {activeTab === 'notes' && (
            <>
              <View style={styles.filtersContainer}>
                <TouchableOpacity
                  style={[styles.filterChip, notesFilter === 'all' && styles.filterChipActive]}
                  onPress={() => setNotesFilter('all')}
                >
                  <Text style={[styles.filterText, notesFilter === 'all' && styles.filterTextActive]}>
                    Toutes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, notesFilter === 'scanned' && styles.filterChipActive]}
                  onPress={() => setNotesFilter('scanned')}
                >
                  <Text style={[styles.filterText, notesFilter === 'scanned' && styles.filterTextActive]}>
                    Scannées
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, notesFilter === 'shared' && styles.filterChipActive]}
                  onPress={() => setNotesFilter('shared')}
                >
                  <Text style={[styles.filterText, notesFilter === 'shared' && styles.filterTextActive]}>
                    Partagées
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.filterChip, notesFilter === 'ai' && styles.filterChipActive]}
                  onPress={() => setNotesFilter('ai')}
                >
                  <Text style={[styles.filterText, notesFilter === 'ai' && styles.filterTextActive]}>
                    Résumées IA
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.section}>
                {filteredNotes.map((note) => (
                  <TouchableOpacity key={note.id} activeOpacity={0.7}>
                    <View style={styles.noteCard}>
                      <LinearGradient
                        colors={['rgba(255, 255, 255, 0.03)', 'rgba(255, 255, 255, 0.01)']}
                        style={styles.noteGradient}
                      >
                        <View style={[
                          styles.noteIcon,
                          { backgroundColor: 
                            note.type === 'scanned' ? 'rgba(117, 102, 217, 0.2)' :
                            note.type === 'shared' ? 'rgba(167, 189, 217, 0.2)' :
                            'rgba(16, 185, 129, 0.2)'
                          }
                        ]}>
                          {note.type === 'scanned' && (
                            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                              <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="#7566d9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                              <Path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#7566d9" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                            </Svg>
                          )}
                          {note.type === 'shared' && (
                            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                              <Circle cx={18} cy={5} r={3} stroke="#a7bdd9" strokeWidth={2}/>
                              <Circle cx={6} cy={12} r={3} stroke="#a7bdd9" strokeWidth={2}/>
                              <Circle cx={18} cy={19} r={3} stroke="#a7bdd9" strokeWidth={2}/>
                              <Path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98" stroke="#a7bdd9" strokeWidth={2}/>
                            </Svg>
                          )}
                          {note.type === 'ai' && (
                            <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
                              <Path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#10b981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                              <Path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#10b981" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/>
                            </Svg>
                          )}
                        </View>
                        <View style={styles.noteContent}>
                          <Text style={styles.noteTitle}>{note.title}</Text>
                          <View style={styles.noteInfo}>
                            <Text style={styles.noteDate}>{note.date}</Text>
                            <Text style={styles.noteDot}>•</Text>
                            <Text style={styles.notePages}>{note.pages} pages</Text>
                            {note.sharedBy && (
                              <>
                                <Text style={styles.noteDot}>•</Text>
                                <Text style={styles.noteShared}>Par {note.sharedBy}</Text>
                              </>
                            )}
                          </View>
                          <View style={styles.noteActions}>
                            <TouchableOpacity style={styles.noteAction}>
                              <Text style={styles.noteActionText}>Voir PDF</Text>
                            </TouchableOpacity>
                            {note.hasAiSummary ? (
                              <TouchableOpacity style={styles.noteAction}>
                                <Text style={styles.noteActionText}>Voir résumé</Text>
                              </TouchableOpacity>
                            ) : (
                              <TouchableOpacity style={styles.noteAction}>
                                <Text style={styles.noteActionText}>Résumer</Text>
                              </TouchableOpacity>
                            )}
                          </View>
                        </View>
                      </LinearGradient>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
              <View style={{height: 40}} />
            </>
          )}
        </ScrollView>
      </LinearGradient>
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
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#ffffff',
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 8,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(117, 102, 217, 0.3)',
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
    paddingBottom: 20,
  },
  monthContainer: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  monthText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  weekNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  weekArrow: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekCenter: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  weekText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  todayButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(117, 102, 217, 0.3)',
    borderRadius: 8,
  },
  todayButtonText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#a7bdd9',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 14,
    overflow: 'hidden',
  },
  addGradient: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  weekCalendar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  dayColumn: {
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.4)',
    letterSpacing: 0.5,
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCircleActive: {
    backgroundColor: 'rgba(117, 102, 217,0.4)',
  },
  dayNumber: {
    fontSize: 15,
    fontWeight: '700',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  dayNumberActive: {
    color: '#ffffff',
  },
  dayDots: {
    flexDirection: 'row',
    gap: 2,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(117, 102, 217, 0.6)',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: 16,
  },
  courseCard: {
    marginBottom: 12,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  courseGradient: {
    flexDirection: 'row',
    padding: 16,
  },
  courseAccent: {
    width: 4,
    borderRadius: 2,
    marginRight: 14,
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
  // TO-DO STYLES
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(117, 102, 217, 0.3)',
    borderColor: 'rgba(117, 102, 217, 0.5)',
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
    borderColor: 'rgba(255, 255, 255, 0.05)',
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
    color: 'rgba(255, 255, 255, 0.4)',
    textDecorationLine: 'line-through',
  },
  urgentBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: 6,
  },
  urgentText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#ef4444',
    letterSpacing: 0.5,
  },
  todoCourse: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.5)',
    marginBottom: 8,
  },
  todoFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  todoDeadline: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  // NOTES STYLES
  noteCard: {
    marginBottom: 12,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  noteGradient: {
    flexDirection: 'row',
    padding: 16,
    gap: 14,
  },
  noteIcon: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  noteInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 12,
  },
  noteDate: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  noteDot: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.3)',
  },
  notePages: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)',
  },
  noteShared: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(167, 189, 217, 0.8)',
  },
  noteActions: {
    flexDirection: 'row',
    gap: 10,
  },
  noteAction: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'rgba(117, 102, 217, 0.2)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(117, 102, 217, 0.3)',
  },
  noteActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#a7bdd9',
  },
});