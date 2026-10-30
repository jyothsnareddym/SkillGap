
import React, {
  useCallback,
  useMemo,
  useState,
} from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";

const PROFILE_KEY = "@skillgap_profile";

type JobRole = {
  id: number;
  title: string;
  category: string;
  description: string;
  responsibilities: string[];
  technicalSkills: string[];
  tools: string[];
  softSkills: string[];
  pathway: string[];
  specializations: string[];
  relatedRoles: string[];
};

type SavedProfile = {
  name?: string;
  skills?: string | string[];
  desiredRole?: string;
  desired_role?: string;
  domain?: string;
  designation?: string;
  experience?: string | number;
  education?: string;
  [key: string]: unknown;
};

const CATEGORIES = [
  "All",
  "Software",
  "Data & AI",
  "Cloud & Security",
  "Business",
];

const JOB_ROLES: JobRole[] = [
  {
    id: 1,
    title: "Java Developer",
    category: "Software",
    description:
      "A Java Developer builds and maintains software applications using Java. They commonly work on backend systems, business applications, and APIs.",
    responsibilities: [
      "Write and maintain Java code.",
      "Build application logic and backend services.",
      "Connect applications to databases.",
      "Debug errors and write tests.",
      "Work with other developers to deliver features.",
    ],
    technicalSkills: [
      "Java",
      "Object-Oriented Programming",
      "Data Structures and Algorithms",
      "SQL",
      "REST APIs",
    ],
    tools: ["IntelliJ IDEA", "Git", "Maven", "Spring Boot"],
    softSkills: ["Problem-solving", "Teamwork", "Communication"],
    pathway: [
      "Learn Java syntax, variables, loops, arrays, strings, and methods.",
      "Understand OOP, collections, exceptions, and file handling.",
      "Practise DSA and learn SQL and database fundamentals.",
      "Learn REST APIs and Spring Boot for backend development.",
      "Understand testing, Git, and basic application deployment.",
    ],
    specializations: [
      "Backend Development",
      "Enterprise Application Development",
      "Microservices",
    ],
    relatedRoles: ["Backend Developer", "Full-Stack Developer"],
  },
  {
    id: 2,
    title: "Data Analyst",
    category: "Data & AI",
    description:
      "A Data Analyst examines data to identify patterns, answer business questions, and help organisations make informed decisions.",
    responsibilities: [
      "Collect and clean datasets.",
      "Analyse trends and patterns.",
      "Prepare reports and dashboards.",
      "Explain findings to stakeholders.",
      "Check data quality and accuracy.",
    ],
    technicalSkills: [
      "SQL",
      "Excel",
      "Python",
      "Statistics",
      "Data Visualization",
    ],
    tools: ["Power BI", "Tableau", "Pandas", "Excel"],
    softSkills: [
      "Analytical thinking",
      "Communication",
      "Attention to detail",
    ],
    pathway: [
      "Learn Excel and basic data handling.",
      "Learn SQL queries, filtering, joins, and aggregation.",
      "Study descriptive statistics and data cleaning.",
      "Learn Python with Pandas and NumPy.",
      "Build dashboards and practise explaining data insights.",
    ],
    specializations: [
      "Business Intelligence",
      "Product Analytics",
      "Marketing Analytics",
    ],
    relatedRoles: ["Business Analyst", "Data Scientist"],
  },
  {
    id: 3,
    title: "Frontend Developer",
    category: "Software",
    description:
      "A Frontend Developer creates the user-facing parts of websites and applications, focusing on layout, interactions, accessibility, and usability.",
    responsibilities: [
      "Build website interfaces.",
      "Convert designs into working pages.",
      "Make interfaces responsive across devices.",
      "Connect the frontend to backend APIs.",
      "Fix interface bugs and improve accessibility.",
    ],
    technicalSkills: [
      "HTML",
      "CSS",
      "JavaScript",
      "Responsive Design",
      "React",
    ],
    tools: ["VS Code", "Git", "Chrome DevTools", "npm"],
    softSkills: [
      "Creativity",
      "Attention to detail",
      "Collaboration",
    ],
    pathway: [
      "Learn HTML structure and semantic elements.",
      "Learn CSS, layouts, Flexbox, Grid, and responsive design.",
      "Learn JavaScript fundamentals and DOM manipulation.",
      "Learn React components, props, state, and hooks.",
      "Practise API integration, accessibility, testing, and Git.",
    ],
    specializations: [
      "React Development",
      "UI Engineering",
      "Web Accessibility",
    ],
    relatedRoles: ["Full-Stack Developer", "UI Engineer"],
  },
  {
    id: 4,
    title: "Full-Stack Developer",
    category: "Software",
    description:
      "A Full-Stack Developer works on both the frontend users interact with and the backend that processes data and application logic.",
    responsibilities: [
      "Develop user interfaces.",
      "Build backend APIs and business logic.",
      "Design database interactions.",
      "Connect frontend and backend systems.",
      "Test and troubleshoot complete applications.",
    ],
    technicalSkills: [
      "HTML and CSS",
      "JavaScript",
      "React",
      "Backend Development",
      "SQL",
    ],
    tools: ["VS Code", "Git", "Node.js", "Postman"],
    softSkills: [
      "Problem-solving",
      "Adaptability",
      "Communication",
    ],
    pathway: [
      "Learn HTML, CSS, and JavaScript.",
      "Learn React and component-based UI development.",
      "Learn a backend stack such as Node.js and Express.",
      "Study SQL, databases, authentication, and REST APIs.",
      "Learn testing, deployment, security, and version control.",
    ],
    specializations: [
      "MERN Stack Development",
      "Enterprise Web Applications",
      "Product Engineering",
    ],
    relatedRoles: ["Frontend Developer", "Backend Developer"],
  },
  {
    id: 5,
    title: "Machine Learning Engineer",
    category: "Data & AI",
    description:
      "A Machine Learning Engineer develops and deploys systems that learn patterns from data to make predictions or automate tasks.",
    responsibilities: [
      "Prepare and process datasets.",
      "Train and evaluate machine learning models.",
      "Improve model performance.",
      "Integrate models into applications.",
      "Monitor deployed models and data quality.",
    ],
    technicalSkills: [
      "Python",
      "Statistics",
      "Linear Algebra",
      "Machine Learning",
      "Model Evaluation",
    ],
    tools: ["Scikit-learn", "PyTorch", "Pandas", "Jupyter"],
    softSkills: [
      "Analytical thinking",
      "Experimentation",
      "Communication",
    ],
    pathway: [
      "Learn Python programming and data structures.",
      "Study probability, statistics, and linear algebra.",
      "Learn NumPy, Pandas, and data preprocessing.",
      "Understand supervised and unsupervised learning.",
      "Learn model evaluation, deployment, and monitoring.",
    ],
    specializations: [
      "Computer Vision",
      "Natural Language Processing",
      "MLOps",
    ],
    relatedRoles: ["Data Scientist", "AI Engineer"],
  },
  {
    id: 6,
    title: "Cloud Engineer",
    category: "Cloud & Security",
    description:
      "A Cloud Engineer helps build, configure, and maintain computing infrastructure and services hosted on cloud platforms.",
    responsibilities: [
      "Configure cloud resources.",
      "Manage computing, storage, and networking.",
      "Monitor system performance and availability.",
      "Apply access controls and security practices.",
      "Automate infrastructure tasks.",
    ],
    technicalSkills: [
      "Linux",
      "Networking",
      "Cloud Fundamentals",
      "Scripting",
      "Security Basics",
    ],
    tools: ["AWS", "Azure", "Docker", "Terraform"],
    softSkills: ["Troubleshooting", "Planning", "Teamwork"],
    pathway: [
      "Learn operating system and Linux fundamentals.",
      "Understand networking, DNS, HTTP, and IP addressing.",
      "Study cloud computing concepts and choose a cloud platform.",
      "Practise compute, storage, networking, and access management.",
      "Learn scripting, containers, infrastructure automation, and monitoring.",
    ],
    specializations: [
      "Cloud Architecture",
      "Cloud Security",
      "Platform Engineering",
    ],
    relatedRoles: ["DevOps Engineer", "Site Reliability Engineer"],
  },
  {
    id: 7,
    title: "Cybersecurity Analyst",
    category: "Cloud & Security",
    description:
      "A Cybersecurity Analyst helps protect systems and information by monitoring threats, investigating suspicious activity, and improving security controls.",
    responsibilities: [
      "Monitor security alerts and system logs.",
      "Investigate suspicious activities.",
      "Identify vulnerabilities and risks.",
      "Support incident response.",
      "Document findings and recommend controls.",
    ],
    technicalSkills: [
      "Networking",
      "Linux",
      "Operating Systems",
      "Security Fundamentals",
      "Log Analysis",
    ],
    tools: ["Wireshark", "SIEM Platforms", "Linux Tools", "Nmap"],
    softSkills: [
      "Critical thinking",
      "Attention to detail",
      "Communication",
    ],
    pathway: [
      "Learn computer networks and operating system fundamentals.",
      "Practise Linux commands and basic scripting.",
      "Study common attacks, vulnerabilities, and defensive controls.",
      "Learn log analysis, monitoring, and incident response.",
      "Use authorised labs to practise detection and investigation.",
    ],
    specializations: [
      "Security Operations",
      "Incident Response",
      "Threat Intelligence",
    ],
    relatedRoles: ["Security Engineer", "Penetration Tester"],
  },
  {
    id: 8,
    title: "Product Manager",
    category: "Business",
    description:
      "A Product Manager helps determine what product to build, why it matters to users, and how a team should prioritise improvements.",
    responsibilities: [
      "Understand user needs and business goals.",
      "Define product requirements and priorities.",
      "Coordinate with design and engineering teams.",
      "Use feedback and metrics to evaluate outcomes.",
      "Communicate product direction and decisions.",
    ],
    technicalSkills: [
      "Product Strategy",
      "User Research",
      "Requirements Gathering",
      "Data Analysis",
      "Prioritization",
    ],
    tools: ["Jira", "Figma", "SQL Basics", "Analytics Tools"],
    softSkills: [
      "Leadership",
      "Communication",
      "Decision-making",
      "Stakeholder Management",
    ],
    pathway: [
      "Understand the product development lifecycle.",
      "Learn user research, personas, and problem definition.",
      "Practise writing requirements and user stories.",
      "Learn prioritization, product metrics, and basic analytics.",
      "Study product strategy and cross-functional collaboration.",
    ],
    specializations: [
      "Technical Product Management",
      "Growth Product Management",
      "Platform Product Management",
    ],
    relatedRoles: ["Business Analyst", "Product Owner"],
  },
];

// Makes matching case-insensitive and ignores punctuation.
function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9+#.]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Levenshtein distance measures how many single-character edits
// are needed to transform one word into another.
function editDistance(first: string, second: string): number {
  const a = first;
  const b = second;

  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  let previous = Array.from(
    { length: b.length + 1 },
    (_, index) => index
  );

  for (let i = 1; i <= a.length; i++) {
    const current = [i];

    for (let j = 1; j <= b.length; j++) {
      const insert = current[j - 1] + 1;
      const remove = previous[j] + 1;
      const replace =
        previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);

      current[j] = Math.min(insert, remove, replace);
    }

    previous = current;
  }

  return previous[b.length];
}

// Allows small spelling mistakes without making unrelated words match.
function wordsMatch(queryWord: string, targetWord: string): boolean {
  if (queryWord === targetWord) return true;

  // Short words need stricter matching to avoid false results.
  if (queryWord.length <= 2 || targetWord.length <= 2) {
    return targetWord.startsWith(queryWord);
  }

  if (
    targetWord.includes(queryWord) ||
    queryWord.includes(targetWord)
  ) {
    return true;
  }

  const distance = editDistance(queryWord, targetWord);
  const longestLength = Math.max(queryWord.length, targetWord.length);

  const allowedDistance =
    longestLength <= 4 ? 1 : longestLength <= 8 ? 2 : 3;

  return distance <= allowedDistance;
}

function fuzzyMatch(query: string, text: string): boolean {
  const normalizedQuery = normalizeText(query);
  const normalizedText = normalizeText(text);

  if (!normalizedQuery) return true;
  if (normalizedText.includes(normalizedQuery)) return true;

  const queryWords = normalizedQuery.split(" ");
  const targetWords = normalizedText.split(" ");

  // Each query word should match at least one word in the role information.
  return queryWords.every((queryWord) =>
    targetWords.some((targetWord) =>
      wordsMatch(queryWord, targetWord)
    )
  );
}


function getRecommendedRoles(profile: SavedProfile | null) {
  if (!profile) return [];

  const rawSkills = profile.skills;

  const skills = Array.isArray(rawSkills)
    ? rawSkills
    : typeof rawSkills === "string"
      ? rawSkills.split(/[,;\n]/)
      : [];

  const userSkills = skills
    .filter((skill): skill is string => typeof skill === "string")
    .map((skill) => normalizeText(skill))
    .filter(Boolean);

  // Do not recommend a role based only on a default career preference.
  if (userSkills.length === 0) {
    return [];
  }

  const desiredRole = String(
    profile.desiredRole ||
      profile.desired_role ||
      profile.designation ||
      ""
  )
    .trim()
    .toLowerCase();

  const domain = String(profile.domain || "")
    .trim()
    .toLowerCase();

  return JOB_ROLES.map((role) => {
    const roleText = [
      role.title,
      role.category,
      ...role.technicalSkills,
      ...role.tools,
      ...role.specializations,
    ]
      .map(normalizeText)
      .join(" ");

    let score = 0;

    if (desiredRole && role.title.toLowerCase() === desiredRole) {
      score += 10;
    } else if (
      desiredRole &&
      (role.title.toLowerCase().includes(desiredRole) ||
        desiredRole.includes(role.title.toLowerCase()))
    ) {
      score += 6;
    }

    userSkills.forEach((skill) => {
      if (skill && roleText.includes(skill)) {
        score += 2;
      }
    });

    if (domain && normalizeText(role.category).includes(normalizeText(domain))) {
      score += 3;
    }

    return { ...role, score };
  })
    .filter((role) => role.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}


function Section({
  title,
  items,
}: {
  title: string;
  items: string[];
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>

      {items.map((item, index) => (
        <View key={`${title}-${index}`} style={styles.listRow}>
          <View style={styles.bullet} />
          <Text style={styles.listText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

function ChipList({ items }: { items: string[] }) {
  return (
    <View style={styles.chipContainer}>
      {items.map((item) => (
        <View key={item} style={styles.chip}>
          <Text style={styles.chipText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export default function DiscoverScreen() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedRole, setSelectedRole] = useState<number | null>(null);
  const [profile, setProfile] = useState<SavedProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const loadProfile = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(PROFILE_KEY);

      if (saved) {
        const parsed: unknown = JSON.parse(saved);

        setProfile(
          parsed && typeof parsed === "object"
            ? (parsed as SavedProfile)
            : null
        );
      } else {
        setProfile(null);
      }
    } catch (error) {
      console.error("Unable to load saved profile:", error);
      setProfile(null);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function refreshProfile() {
        try {
          const saved = await AsyncStorage.getItem(PROFILE_KEY);

          if (!active) return;

          setProfile(
            saved ? (JSON.parse(saved) as SavedProfile) : null
          );
        } catch (error) {
          console.error("Unable to load saved profile:", error);

          if (active) setProfile(null);
        } finally {
          if (active) setProfileLoading(false);
        }
      }

      refreshProfile();

      return () => {
        active = false;
      };
    }, [])
  );

  const recommendedRoles = useMemo(
    () => getRecommendedRoles(profile),
    [profile]
  );

  const filteredRoles = useMemo(() => {
    const query = search.trim();

    return JOB_ROLES.filter((role) => {
      const matchesCategory =
        category === "All" || role.category === category;

      if (!matchesCategory) return false;
      if (!query) return true;

      const searchableFields = [
        role.title,
        role.category,
        role.description,
        ...role.responsibilities,
        ...role.technicalSkills,
        ...role.tools,
        ...role.softSkills,
        ...role.pathway,
        ...role.specializations,
        ...role.relatedRoles,
      ];

      return searchableFields.some((field) =>
        fuzzyMatch(query, field)
      );
    });
  }, [search, category]);

  const suggestedRoles = useMemo(() => {
    if (!search.trim() || filteredRoles.length > 0) return [];

    return JOB_ROLES.map((role) => {
      const titleScore = editDistance(
        normalizeText(search),
        normalizeText(role.title)
      );

      return { role, titleScore };
    })
      .filter(({ titleScore }) => titleScore <= 4)
      .sort((a, b) => a.titleScore - b.titleScore)
      .slice(0, 3)
      .map(({ role }) => role);
  }, [search, filteredRoles.length]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>EXPLORE CAREERS</Text>
          <Text style={styles.title}>Discover</Text>
          <Text style={styles.subtitle}>
            Explore job roles, understand what people do at work,
            and discover the skills you can learn to get started.
          </Text>
        </View>

        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>

          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search roles, skills or tools..."
            placeholderTextColor="#8B93A7"
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Search job roles and skills"
          />

          {search.length > 0 && (
            <Pressable
              onPress={() => setSearch("")}
              accessibilityRole="button"
              accessibilityLabel="Clear search"
            >
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          )}
        </View>

        {!search.trim() && (
          <View style={styles.searchHint}>
            <Text style={styles.searchHintTitle}>New to tech careers?</Text>
            <Text style={styles.searchHintText}>
              Search a role such as Data Analyst to learn what the job
              involves, what skills it needs, and how to start learning.
            </Text>
          </View>
        )}

        {!search.trim() && (
          <View style={styles.recommendationsSection}>
            <Text style={styles.resultsTitle}>Recommended for you</Text>
            <Text style={styles.recommendationSubtitle}>
              Based on your saved skills and career preferences
            </Text>

            {profileLoading ? (
              <Text style={styles.stateText}>Loading your profile...</Text>
            ) : recommendedRoles.length > 0 ? (
              recommendedRoles.map((role) => (
                <Pressable
                  key={role.id}
                  style={styles.recommendedCard}
                  onPress={() => {
                    setCategory("All");
                    setSearch("");
                    setSelectedRole(role.id);
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text style={styles.roleTitle}>{role.title}</Text>
                    <Text style={styles.recommendationSubtitle}>
                      {role.category} ·{" "}
                      {role.technicalSkills.slice(0, 3).join(", ")}
                    </Text>
                  </View>

                  <Text style={styles.expandIcon}>→</Text>
                </Pressable>
              ))
            ) : (
              <View style={styles.infoCard}>
                <Text style={styles.infoTitle}>
                  Explore your career options
                </Text>
                <Text style={styles.infoText}>
                  Add your skills and career preferences in Profile
                  to get personalised suggestions. You can explore
                  every role below without completing your profile.
                </Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.filterLabel}>EXPLORE BY FIELD</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filters}
        >
          {CATEGORIES.map((item) => {
            const active = category === item;

            return (
              <Pressable
                key={item}
                onPress={() => setCategory(item)}
                style={[
                  styles.filterChip,
                  active && styles.filterChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.filterText,
                    active && styles.filterTextActive,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.resultsHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.resultsTitle}>
              {search.trim() ? "Search results" : "Explore job roles"}
            </Text>

            {search.trim() ? (
              <Text style={styles.recommendationSubtitle}>
                Results for "{search.trim()}"
              </Text>
            ) : null}
          </View>

          <Text style={styles.resultsCount}>
            {filteredRoles.length}{" "}
            {filteredRoles.length === 1 ? "role" : "roles"}
          </Text>
        </View>

        {filteredRoles.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No exact matches found</Text>
            <Text style={styles.emptyText}>
              Try another spelling, a shorter keyword, or a skill such
              as Python, SQL, Java, React, or networking.
            </Text>

            {suggestedRoles.length > 0 && (
              <View style={styles.suggestionsSection}>
                <Text style={styles.suggestionsTitle}>
                  Roles you may be looking for
                </Text>

                {suggestedRoles.map((role) => (
                  <Pressable
                    key={role.id}
                    style={styles.suggestionButton}
                    onPress={() => {
                      setSearch("");
                      setCategory("All");
                      setSelectedRole(role.id);
                    }}
                  >
                    <Text style={styles.suggestionText}>
                      {role.title}
                    </Text>
                    <Text style={styles.expandIcon}>→</Text>
                  </Pressable>
                ))}
              </View>
            )}

            <Pressable
              onPress={() => {
                setSearch("");
                setCategory("All");
                setSelectedRole(null);
              }}
              style={styles.resetButton}
            >
              <Text style={styles.resetButtonText}>Show all roles</Text>
            </Pressable>
          </View>
        ) : (
          filteredRoles.map((role) => {
            const expanded = selectedRole === role.id;

            return (
              <View key={role.id} style={styles.roleCard}>
                <Pressable
                  style={styles.roleHeader}
                  onPress={() =>
                    setSelectedRole(expanded ? null : role.id)
                  }
                  accessibilityRole="button"
                  accessibilityLabel={`${role.title}, ${expanded ? "collapse" : "view details"}`}
                >
                  <View style={styles.roleIcon}>
                    <Text style={styles.roleIconText}>
                      {role.category === "Software"
                        ? "</>"
                        : role.category === "Data & AI"
                          ? "AI"
                          : role.category === "Cloud & Security"
                            ? "☁"
                            : "PM"}
                    </Text>
                  </View>

                  <View style={styles.roleHeading}>
                    <Text style={styles.roleCategory}>
                      {role.category.toUpperCase()}
                    </Text>

                    <Text style={styles.roleTitle}>{role.title}</Text>

                    <Text
                      style={styles.roleDescription}
                      numberOfLines={expanded ? undefined : 3}
                    >
                      {role.description}
                    </Text>
                  </View>

                  <Text style={styles.expandIcon}>
                    {expanded ? "−" : "+"}
                  </Text>
                </Pressable>

                {expanded && (
                  <View style={styles.details}>
                    <View style={styles.divider} />

                    <Section
                      title="1. What does this role involve?"
                      items={role.responsibilities}
                    />

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>
                        2. Skills & tools required
                      </Text>

                      <Text style={styles.subheading}>
                        Technical skills
                      </Text>
                      <ChipList items={role.technicalSkills} />

                      <Text style={styles.subheading}>
                        Tools & technologies
                      </Text>
                      <ChipList items={role.tools} />

                      <Text style={styles.subheading}>Soft skills</Text>
                      <ChipList items={role.softSkills} />
                    </View>

                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>
                        3. Beginner learning pathway
                      </Text>

                      <Text style={styles.pathIntro}>
                        Follow these steps in order to build your
                        knowledge from the fundamentals.
                      </Text>

                      {role.pathway.map((step, index) => (
                        <View
                          key={`${role.id}-step-${index}`}
                          style={styles.pathRow}
                        >
                          <View style={styles.stepNumber}>
                            <Text style={styles.stepNumberText}>
                              {index + 1}
                            </Text>
                          </View>

                          <Text style={styles.pathText}>{step}</Text>
                        </View>
                      ))}

                      <Text style={styles.subheading}>
                        Possible specializations
                      </Text>
                      <ChipList items={role.specializations} />

                      <Text style={styles.subheading}>
                        Related careers
                      </Text>
                      <ChipList items={role.relatedRoles} />
                    </View>

                    <Pressable
                      style={styles.collapseButton}
                      onPress={() => setSelectedRole(null)}
                    >
                      <Text style={styles.collapseButtonText}>
                        Show less ↑
                      </Text>
                    </Pressable>
                  </View>
                )}
              </View>
            );
          })
        )}

        <Text style={styles.footer}>
          Start with the role that interests you. You do not need to
          know the required skills before exploring a career.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F7F8FC",
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    marginBottom: 22,
  },
  eyebrow: {
    color: "#6756D8",
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#171B2D",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 22,
    color: "#687086",
  },
  searchBox: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E8F1",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  searchIcon: {
    fontSize: 25,
    color: "#737B90",
    marginRight: 9,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#171B2D",
    paddingVertical: 13,
  },
  clearText: {
    color: "#6756D8",
    fontSize: 12,
    fontWeight: "700",
    paddingLeft: 8,
  },
  searchHint: {
    backgroundColor: "#F0EDFF",
    borderWidth: 1,
    borderColor: "#E0DBFF",
    borderRadius: 14,
    padding: 15,
    marginBottom: 24,
  },
  searchHintTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#40368E",
    marginBottom: 5,
  },
  searchHintText: {
    fontSize: 12,
    lineHeight: 19,
    color: "#5F5894",
  },
  recommendationsSection: {
    marginBottom: 25,
  },
  recommendationSubtitle: {
    fontSize: 12,
    lineHeight: 19,
    color: "#737B90",
    marginTop: 5,
    marginBottom: 10,
  },
  recommendedCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0EDFF",
    borderWidth: 1,
    borderColor: "#E0DBFF",
    borderRadius: 14,
    padding: 14,
    marginTop: 10,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E8EAF2",
    borderRadius: 14,
    padding: 15,
    marginTop: 10,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: "800",
    color: "#20243A",
  },
  infoText: {
    fontSize: 12,
    lineHeight: 19,
    color: "#737B90",
    marginTop: 6,
  },
  filterLabel: {
    color: "#81889B",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.2,
    marginBottom: 12,
  },
  filters: {
    gap: 8,
    paddingBottom: 6,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E8F1",
  },
  filterChipActive: {
    backgroundColor: "#6756D8",
    borderColor: "#6756D8",
  },
  filterText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#626B81",
  },
  filterTextActive: {
    color: "#FFFFFF",
  },
  resultsHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 23,
    marginBottom: 13,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#171B2D",
  },
  resultsCount: {
    color: "#737B90",
    fontSize: 12,
  },
  roleCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#E8EAF2",
    marginBottom: 13,
    overflow: "hidden",
  },
  roleHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    padding: 15,
  },
  roleIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: "#F0EDFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  roleIconText: {
    color: "#6756D8",
    fontSize: 14,
    fontWeight: "800",
  },
  roleHeading: {
    flex: 1,
  },
  roleCategory: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 1,
    color: "#7869D9",
    marginBottom: 5,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#20243A",
    marginBottom: 6,
  },
  roleDescription: {
    fontSize: 12,
    lineHeight: 19,
    color: "#737B90",
  },
  expandIcon: {
    fontSize: 24,
    color: "#6756D8",
    paddingLeft: 8,
    fontWeight: "400",
  },
  details: {
    paddingHorizontal: 15,
    paddingBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: "#ECEEF5",
    marginBottom: 6,
  },
  section: {
    marginTop: 17,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#22263B",
    marginBottom: 12,
  },
  listRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#8172E5",
    marginTop: 6,
    marginRight: 10,
  },
  listText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: "#5F687E",
  },
  subheading: {
    fontSize: 12,
    fontWeight: "700",
    color: "#454C63",
    marginTop: 12,
    marginBottom: 9,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
  },
  chip: {
    backgroundColor: "#F2F1FF",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  chipText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#5C4FC0",
  },
  pathIntro: {
    fontSize: 12,
    lineHeight: 19,
    color: "#737B90",
    marginBottom: 14,
  },
  pathRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  stepNumber: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#EDEAFF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },
  stepNumberText: {
    color: "#6756D8",
    fontWeight: "800",
    fontSize: 12,
  },
  pathText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 20,
    color: "#5F687E",
    paddingTop: 3,
  },
  emptyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E8EAF2",
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "800",
    color: "#20243A",
    marginBottom: 7,
    textAlign: "center",
  },
  emptyText: {
    fontSize: 13,
    color: "#737B90",
    textAlign: "center",
    lineHeight: 20,
  },
  suggestionsSection: {
    width: "100%",
    marginTop: 20,
  },
  suggestionsTitle: {
    fontSize: 13,
    fontWeight: "800",
    color: "#454C63",
    marginBottom: 8,
  },
  suggestionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#F4F2FF",
    marginTop: 7,
  },
  suggestionText: {
    color: "#5C4FC0",
    fontSize: 13,
    fontWeight: "700",
  },
  resetButton: {
    marginTop: 17,
    backgroundColor: "#6756D8",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  resetButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
  stateText: {
    color: "#737B90",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 8,
  },
  collapseButton: {
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  collapseButtonText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6756D8",
  },
  footer: {
    color: "#8A91A3",
    fontSize: 11,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 8,
  },
});
