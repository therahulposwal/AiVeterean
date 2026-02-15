import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';
import { type EducationItem, type VeteranProfilePayload, type WorkExperienceItem } from '@/types/profile';

// 1. Register Open Sans Font
Font.register({
  family: 'Open Sans',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf',
      fontWeight: 'bold', 
    },
  ],
});

// Disable hyphenation globally
Font.registerHyphenationCallback(word => [word]);

const colors = {
  text: '#333333',
  primaryBlue: '#1155cc', 
  lightBlueBg: '#E8F0F8', 
  grey: '#555555',
};

const styles = StyleSheet.create({
  page: {
    paddingTop: 30,
    paddingBottom: 30,
    paddingHorizontal: 40,
    fontFamily: 'Open Sans',
    fontSize: 10,
    lineHeight: 1.4,
    color: colors.text,
  },
  // Header Section
  headerContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 25,
  },
  rankText: {
    fontWeight: 'normal',
  },
  tagline: {
    fontSize: 9,
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 10,
    color: '#000',
  },
  // Blue Contact Bar
  contactBar: {
    backgroundColor: colors.lightBlueBg,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 4,
    width: '100%',
    marginBottom: 15,
  },
  contactText: {
    fontSize: 9,
    color: '#0044cc',
  },
  separator: {
    marginHorizontal: 4,
    color: '#0044cc',
  },
  
  // Section Styling
  section: {
    marginBottom: 12,
  },
  mainHeader: {
    fontSize: 12,
    color: '#222',
    marginBottom: 6,
    textTransform: 'none',
  },
  
  // Content Styles
  summaryText: {
    fontSize: 10,
    textAlign: 'justify',
  },
  
  // Work Experience Specifics
  jobBlock: {
    marginBottom: 10,
  },
  companyLine: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  companyName: {
    color: colors.primaryBlue,
    fontSize: 11,
    fontWeight:'500'
  },
  roleLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  roleTitle: {
    fontWeight: '500', 
    fontSize: 10,
    color: '#000',
  },
  dates: {
    fontSize: 10,
    color: '#444',
  },
  
  // Lists/Bullets
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 2,
    paddingLeft: 4,
    paddingRight: 10,
  },
  bullet: {
    width: 10,
    fontSize: 10,
    marginTop: -1,
  },
  bulletContent: {
    flex: 1,
    fontSize: 10,
    textAlign: 'justify', 
  },

  // Sub-headers (Education, Courses, Awards)
  blueSubHeader: {
    fontSize: 11,
    fontWeight: '500', 
    color: colors.primaryBlue,
    marginBottom: 4,
    marginTop: 4,
  },
});

interface ResumeProps {
  data: VeteranProfilePayload;
}

export const StandardATS = ({ data }: ResumeProps) => {
  const fullName = data?.fullName?.trim() || 'Manoj Sharma'; 
  const email = data?.email?.trim();
  const phoneNumber = data?.phoneNumber?.trim();
  const linkedin = data?.linkedin?.trim();
  
  const profileData = data?.profileData ?? {
    professionalSummary: '',
    workExperience: [],
    technicalSkills: [],
    softSkills: [],
    courses: [],
    achievements: [],
    education: [],
  };

  const professionalSummary = profileData.professionalSummary?.trim();
  const workExperience = (profileData.workExperience ?? []).filter(
    (job) => job.role?.trim() || job.unit?.trim() || (job.responsibilities ?? []).some((r) => r?.trim())
  );
  
  const technicalSkills = (profileData.technicalSkills ?? []).map((s) => s.trim()).filter(Boolean);
  const softSkills = (profileData.softSkills ?? []).map((s) => s.trim()).filter(Boolean);
  const allSkills = [...technicalSkills, ...softSkills];

  const education = (profileData.education ?? []).filter(
    (edu) => edu.degree?.trim() || edu.institution?.trim()
  );
  const courses = (profileData.courses ?? []).map((s) => s.trim()).filter(Boolean);
  const achievements = (profileData.achievements ?? []).map((s) => s.trim()).filter(Boolean);

  const contactItems = [phoneNumber, email, linkedin].filter(Boolean) as string[];

  const renderBullets = (items: string[]) => (
    items.map((item, i) => (
      <View key={i} style={styles.bulletPoint}>
        <Text style={styles.bullet}>•</Text>
        <Text style={styles.bulletContent}>{item}</Text>
      </View>
    ))
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.headerContainer}>
          <Text style={styles.name}>
             {data?.rank ? <Text style={styles.rankText}>{`${data.rank} `}</Text> : ''}
             {fullName}
          </Text>
        </View>

        {/* Contact Bar */}
        <View style={styles.contactBar}>
          {contactItems.map((item, index) => (
            <React.Fragment key={index}>
              <Text style={styles.contactText}>{item}</Text>
              {index < contactItems.length - 1 && <Text style={styles.separator}>|</Text>}
            </React.Fragment>
          ))}
        </View>

        {/* Professional Summary */}
        <View style={styles.section}>
          <Text style={styles.mainHeader}>Professional Summary</Text>
          <Text style={styles.summaryText}>
            {professionalSummary || 'A seasoned Security Leader with over 10 years of experience in security operations, risk management, and crisis leadership.'}
          </Text>
        </View>

        {/* Work Experience */}
        <View style={styles.section}>
          <Text style={styles.mainHeader}>Work Experience</Text>
          {workExperience.length > 0 ? (
            workExperience.map((job: WorkExperienceItem, i: number) => (
              <View key={i} style={styles.jobBlock}>
                <View style={styles.companyLine}>
                   <Text style={styles.companyName}>
                     {job.unit || 'Organization'} 
                     {job.location ? ` | ${job.location}` : ''}
                   </Text>
                </View>
                
                <View style={styles.roleLine}>
                  <Text style={styles.roleTitle}>{job.role || 'Role Title'}</Text>
                  <Text style={styles.dates}>
                    ({job.startDate || 'Start'} – {job.endDate || 'Present'})
                  </Text>
                </View>

                {renderBullets((job.responsibilities ?? []).map(r => r.trim()).filter(Boolean))}
              </View>
            ))
          ) : (
             <Text style={{ fontStyle: 'italic', fontSize: 10, color: '#666'}}>Experience details pending...</Text>
          )}
        </View>

        {/* Education, Courses and Training */}
        <View style={styles.section}>
          <Text style={styles.mainHeader}>Education, Courses and Training</Text>
          
          <Text style={styles.blueSubHeader}>Education</Text>
          {education.length > 0 ? (
             education.map((edu: any, i) => (
               <View key={i} style={styles.bulletPoint}>
                 <Text style={styles.bullet}>•</Text>
                 <Text style={styles.bulletContent}>
                   {edu.degree}
                   {edu.institution ? ` - ${edu.institution}` : ''}
                   {edu.year ? ` | ${edu.year}` : ''}
                   {edu.marks ? ` | Grade: ${edu.marks}` : ''}
                 </Text>
               </View>
             ))
          ) : (
             <View style={styles.bulletPoint}><Text style={styles.bullet}>•</Text><Text style={styles.bulletContent}>Degree details pending</Text></View>
          )}

           {allSkills.length > 0 && (
            <>
              <Text style={styles.blueSubHeader}>Skills & Core Competencies</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingLeft: 14 }}>
                 <Text style={{ fontSize: 10, lineHeight: 1.5 }}>
                   {allSkills.join(' • ')}
                 </Text>
              </View>
            </>
          )}

          <Text style={styles.blueSubHeader}>Courses & Certifications:</Text>
          {courses.length > 0 ? renderBullets(courses) : (
            <View style={styles.bulletPoint}><Text style={styles.bullet}>•</Text><Text style={styles.bulletContent}>Certification details pending</Text></View>
          )}
        </View>

        {/* Awards Section */}
        <View style={styles.section}>
           <Text style={styles.blueSubHeader}>Awards & Recognitions:</Text>
           {achievements.length > 0 ? renderBullets(achievements) : (
             <View style={styles.bulletPoint}><Text style={styles.bullet}>•</Text><Text style={styles.bulletContent}>Awards details pending</Text></View>
           )}
        </View>

      </Page>
    </Document>
  );
};
