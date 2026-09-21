import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db';
import { User } from '../models/User';
import { Consultant } from '../models/Consultant';
import { Booking } from '../models/Booking';
import { Review } from '../models/Review';
import { BlockedSlot } from '../models/BlockedSlot';
import { Payment } from '../models/Payment';

export const USER_REVIEWS_CATALOG = [
  {
    name: 'Aarav Sharma',
    comment: 'Clear and practical career consulting. I was confused about which direction to take after graduation, but the roadmap gave me a much better understanding of what skills and roles I should target.',
    rating: 5,
    tag: 'Fresher / Graduate',
  },
  {
    name: 'Priya Kulkarni',
    comment: 'The counselling session was very straightforward. Instead of giving generic advice, I received a clear career roadmap based on my current skills and goals.',
    rating: 5,
    tag: 'Roadmap & Strategy',
  },
  {
    name: 'Rohan Patil',
    comment: 'I was applying for jobs randomly without getting results. The consultation helped me understand where I was going wrong and how to improve my approach.',
    rating: 4,
    tag: 'Job Search',
  },
  {
    name: 'Sneha Joshi',
    comment: 'Very useful guidance for a fresher. I got clarity about which technologies to learn, which roles to apply for, and how to prepare for interviews.',
    rating: 4.5,
    tag: 'Fresher Guidance',
  },
  {
    name: 'Aditya Verma',
    comment: 'The best part was the clear-cut consulting. Everything was explained practically without making the process complicated.',
    rating: 5,
    tag: 'Practical Consulting',
  },
  {
    name: 'Neha Deshmukh',
    comment: 'I was unsure whether I should continue in my current field or switch careers. The counselling helped me compare both options and make a much more informed decision.',
    rating: 5,
    tag: 'Career Transition',
  },
  {
    name: 'Vivek Gupta',
    comment: 'Excellent career guidance. The roadmap helped me understand what I should focus on during the next few months instead of trying to learn everything at once.',
    rating: 4.5,
    tag: 'Focus & Prioritization',
  },
  {
    name: 'Kavya Nair',
    comment: 'As a student, I was confused about what to do after my degree. The session gave me a realistic understanding of career options and skill requirements.',
    rating: 5,
    tag: 'Student Mentorship',
  },
  {
    name: 'Siddharth Jadhav',
    comment: 'I appreciated the practical approach. There was no unnecessary discussion—just clear advice about my career, skills, resume and job strategy.',
    rating: 4.5,
    tag: 'Resume & Strategy',
  },
  {
    name: 'Anjali Mehta',
    comment: 'The counselling helped me identify the gap between my current profile and the jobs I wanted. I now have a proper plan to work on those gaps.',
    rating: 5,
    tag: 'Skill Gap Analysis',
  },
  {
    name: 'Rahul Chavan',
    comment: 'I received very useful guidance regarding skill development. I was specifically looking for a good institute and got suggestions based on my career objective rather than random recommendations.',
    rating: 5,
    tag: 'Skill Development',
  },
  {
    name: 'Isha Singh',
    comment: "Very helpful for students who don't know where to start. The roadmap made my career preparation much more structured.",
    rating: 5,
    tag: 'Student Mentorship',
  },
  {
    name: 'Manish Yadav',
    comment: 'I had been working in the same role for a long time and wanted better opportunities. The consultation helped me understand how to position my experience for my next career move.',
    rating: 4.5,
    tag: 'Working Professional',
  },
  {
    name: 'Pooja Pawar',
    comment: 'The fees were reasonable compared with the clarity I received. I finally understood which career path actually made sense for me.',
    rating: 5,
    tag: 'Career Clarity',
  },
  {
    name: 'Karan Malhotra',
    comment: 'I was struggling to decide between two career options. The consultant explained the pros, cons and long-term opportunities very clearly.',
    rating: 5,
    tag: 'Decision Making',
  },
  {
    name: 'Ritika Sharma',
    comment: 'Good career counselling for fresh graduates. The advice was practical, realistic and focused on employability.',
    rating: 5,
    tag: 'Fresher Guidance',
  },
  {
    name: 'Akshay More',
    comment: 'The guidance helped me restructure my job-search strategy. I stopped applying blindly and started targeting roles that actually matched my profile.',
    rating: 5,
    tag: 'Job Strategy',
  },
  {
    name: 'Simran Kaur',
    comment: 'Very professional consultation. I received a step-by-step roadmap covering skills, resume improvement, applications and interview preparation.',
    rating: 5,
    tag: 'Step-by-Step Roadmap',
  },
  {
    name: 'Nikhil Bansal',
    comment: 'I was able to secure a new opportunity with a 15% salary hike after following the career and interview guidance.',
    rating: 5,
    tag: '+15% Salary Hike',
  },
  {
    name: 'Tanvi Desai',
    comment: "The biggest benefit was clarity. I knew what I wanted to achieve, but I didn't know how to reach there. The roadmap changed that.",
    rating: 5,
    tag: 'Career Clarity',
  },
  {
    name: 'Harsh Vora',
    comment: 'Excellent support for working professionals. The discussion was focused on my experience and future growth rather than generic career advice.',
    rating: 5,
    tag: 'Working Professional',
  },
  {
    name: 'Shreya Patil',
    comment: "I was looking for a career switch but didn't know which skills were actually required. The counselling helped me create a realistic transition plan.",
    rating: 5,
    tag: 'Career Switch',
  },
  {
    name: 'Yash Thakur',
    comment: "The consultant gave me honest feedback about my profile. It wasn't sugar-coated, and that was exactly what I needed.",
    rating: 5,
    tag: 'Honest Feedback',
  },
  {
    name: 'Komal Shah',
    comment: "I received guidance on choosing the right skill-development program instead of spending money on courses that weren't relevant to my career.",
    rating: 5,
    tag: 'Smart Learning',
  },
  {
    name: 'Amit Joshi',
    comment: 'Within 22 days, I was able to secure a job opportunity after improving my resume, applications and interview preparation based on the guidance.',
    rating: 5,
    tag: 'Job in 22 Days',
  },
  {
    name: 'Divya Reddy',
    comment: 'Very helpful for someone starting their career. I got clarity about the difference between simply completing courses and actually becoming job-ready.',
    rating: 5,
    tag: 'Job Readiness',
  },
  {
    name: 'Saurabh Mishra',
    comment: 'The consultation helped me understand what companies were actually looking for in my field. My job search became much more focused.',
    rating: 5,
    tag: 'Market Insights',
  },
  {
    name: 'Meenal Wagh',
    comment: "I liked the honest and practical approach. The consultant didn't push unnecessary courses and instead suggested what I genuinely needed.",
    rating: 5,
    tag: 'Zero Upsell',
  },
  {
    name: 'Abhishek Tiwari',
    comment: 'After following the recommended career strategy, I received an opportunity with approximately a 33% salary hike.',
    rating: 5,
    tag: '+33% Salary Hike',
  },
  {
    name: 'Riya Kapoor',
    comment: 'I was completely confused after graduation. The counselling gave me a structured roadmap covering skills, projects, resume and job applications.',
    rating: 5,
    tag: 'Fresher Roadmap',
  },
  {
    name: 'Omkar Shinde',
    comment: 'Good consulting at a reasonable fee. I got much more clarity about my career direction than I expected.',
    rating: 4.5,
    tag: 'High ROI',
  },
  {
    name: 'Nandini Rao',
    comment: 'The guidance helped me understand which certifications were actually useful for my target role and which ones I could avoid.',
    rating: 4.5,
    tag: 'Certification Advice',
  },
  {
    name: 'Mohit Agarwal',
    comment: 'I had been searching for a job for months. The changes suggested during counselling helped me improve my approach, and I received an opportunity within 45 days.',
    rating: 5,
    tag: 'Placed in 45 Days',
  },
  {
    name: 'Ayesha Khan',
    comment: 'Very useful career counselling for students. I got a clear understanding of what to learn and how to build my profile before applying for jobs.',
    rating: 5,
    tag: 'Student Profile Building',
  },
  {
    name: 'Pratik Pawar',
    comment: 'The consultant helped me identify the skills holding back my career growth. The roadmap was simple enough to follow and specific enough to be useful.',
    rating: 4.5,
    tag: 'Growth Blockers',
  },
  {
    name: 'Shubham Gupta',
    comment: 'I achieved a 45% salary hike after preparing properly for my career move. The guidance around profile positioning and interview preparation was particularly useful.',
    rating: 5,
    tag: '+45% Salary Hike',
  },
  {
    name: 'Swati Kapse',
    comment: 'I was unsure whether I needed another degree or simply the right technical skills. The consultation helped me make a much more practical decision.',
    rating: 4,
    tag: 'Degree vs Skills',
  },
  {
    name: 'Vishal Soni',
    comment: 'Straightforward and professional career advice. I especially liked the focus on actual job opportunities rather than unrealistic promises.',
    rating: 5,
    tag: 'Realistic Advice',
  },
  {
    name: 'Pallavi Nair',
    comment: 'The roadmap gave me a clear sequence: what to learn first, what projects to build, when to improve my resume and when to start applying.',
    rating: 5,
    tag: 'Sequential Roadmap',
  },
  {
    name: 'Deepak Rajput',
    comment: "After several unsuccessful applications, I finally understood that the problem wasn't only the number of applications—it was how I was presenting my skills. Very valuable guidance.",
    rating: 5,
    tag: 'Skill Presentation',
  },
  {
    name: 'Mansi Jain',
    comment: 'I received a 100% salary hike after making a planned career move. The counselling helped me understand my market value and prepare accordingly.',
    rating: 5,
    tag: '+100% Salary Hike',
  },
  {
    name: 'Tejas Patil',
    comment: 'Very good guidance for freshers. I got clarity about realistic salary expectations, suitable job roles and the skills I should develop.',
    rating: 5,
    tag: 'Fresher Expectations',
  },
  {
    name: 'Swati Sharma',
    comment: 'The consultant understood my situation before suggesting anything. The advice felt personalised rather than like a standard counselling session.',
    rating: 5,
    tag: 'Personalized Coaching',
  },
  {
    name: 'Raj Mehra',
    comment: 'I was considering changing my career but was worried about starting again. The consultation helped me identify transferable skills and a practical transition path.',
    rating: 4.5,
    tag: 'Career Switch',
  },
  {
    name: 'Poonam Choudhary',
    comment: 'The biggest takeaway was the career roadmap. Instead of feeling lost, I now have measurable steps to follow for the next few months.',
    rating: 5,
    tag: 'Measurable Steps',
  },
  {
    name: 'Arjun Deshmukh',
    comment: 'I received an opportunity with around a 15% hike after improving my profile and interview preparation. The guidance was practical and easy to implement.',
    rating: 5,
    tag: '+15% Salary Hike',
  },
  {
    name: 'Snehal More',
    comment: 'I would recommend this counselling to students who are confused about career choices. The session gave me clarity about skills, institutes, job roles and the overall career path.',
    rating: 5,
    tag: 'Student Recommendation',
  },
  {
    name: 'Varun Kapoor',
    comment: 'Professional, transparent and to the point. I especially appreciated the fact that the consultant explained both the opportunities and the challenges before recommending a career path.',
    rating: 5,
    tag: 'Transparent & Direct',
  },
];

const seedDatabase = async () => {
  console.log('[Seed] Starting database seed process...');
  await connectDB();

  await Promise.all([
    User.deleteMany({}),
    Consultant.deleteMany({}),
    Booking.deleteMany({}),
    Review.deleteMany({}),
    BlockedSlot.deleteMany({}),
    Payment.deleteMany({}),
  ]);
  console.log('[Seed] Cleared existing data.');

  // 1. Create Users
  const passwordSalt = await bcrypt.genSalt(10);
  const adminHash = await bcrypt.hash('Admin@1234', passwordSalt);
  const clientHash = await bcrypt.hash('Client@1234', passwordSalt);

  const adminUser = await User.create({
    name: 'ConsultFlow Admin',
    email: 'admin@consultflow.com',
    phone: '+91 98765 43210',
    passwordHash: adminHash,
    role: 'ADMIN',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  });

  const clientUser = await User.create({
    name: 'Aditya Verma',
    email: 'client@example.com',
    phone: '+91 91234 56789',
    passwordHash: clientHash,
    role: 'USER',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  });

  const secondClient = await User.create({
    name: 'Neha Deshmukh',
    email: 'neha@example.com',
    phone: '+91 98111 22334',
    passwordHash: clientHash,
    role: 'USER',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  });

  // 2. Create Consultants
  const consultantsData = [
    {
      name: 'Ashish Lichode',
      email: 'ashish.lichode@consultflow.org',
      phone: '+91 98201 11223',
      avatar: 'https://media.licdn.com/dms/image/v2/D5603AQHgvioDlx9_IQ/profile-displayphoto-crop_800_800/B56Z6Y4CHeKsAM-/0/1780681286875?e=1790812800&v=beta&t=cNJpjcdLhjrXD9yCIux7_f5gICB2sThInUDzYEbESkI',
      domain: 'Engineering Consultant',
      bio: 'Principal Engineering Consultant with 12+ years experience mentoring engineering students, fresh graduates, and experienced engineers. Practical roadmaps for career transitions, resume enhancement, and high-growth tech roles.',
      skills: ['Career Roadmap', 'Resume Strategy', 'System Architecture', 'Interview Prep', 'Salary Negotiation', 'Data Analysis', 'Data Engineering', 'AI/ML', 'Automotive', 'Semiconductor', 'Software Engineering'],
      expertise: ['Career Roadmap', 'Resume Strategy', 'System Architecture', 'Interview Prep', 'Salary Negotiation'],
      technicalSkills: ['Data Analysis', 'Data Engineering', 'AI/ML', 'Automotive', 'Semiconductor', 'Software Engineering'],
      rating: 4.9,
      reviewCount: 48,
      fee: 999,
      slotDuration: 20,
      minNoticeHours: 0,
      workingDays: [0, 1, 2, 3, 4, 5, 6],
      workingHours: { start: '19:00', end: '21:00' },
      isActive: true,
    },
  ];

  const createdConsultants = await Consultant.insertMany(consultantsData);
  console.log(`[Seed] Created ${createdConsultants.length} consultant: Ashish Lichode.`);

  // Create User account for Ashish Lichode
  const mentorHash = await bcrypt.hash('Mentor@1234', passwordSalt);

  await User.create({
    name: 'Ashish Lichode',
    email: 'ashish.lichode@consultflow.org',
    phone: '+91 98201 11223',
    passwordHash: mentorHash,
    role: 'CONSULTANT',
    consultantId: createdConsultants[0]._id,
    avatar: createdConsultants[0].avatar,
  });
  console.log('[Seed] Created consultant user login account for Ashish Lichode.');

  // 3. Seed ALL 48 USER REVIEWS
  const reviewsToInsert = USER_REVIEWS_CATALOG.map((rev) => ({
    consultantId: createdConsultants[0]._id,
    userId: clientUser._id,
    userName: rev.name,
    rating: rev.rating,
    comment: rev.comment,
    createdAt: new Date(Date.now() - Math.floor(Math.random() * 60 * 86400000)),
  }));

  await Review.insertMany(reviewsToInsert);
  console.log(`[Seed] Successfully seeded all ${reviewsToInsert.length} authentic user reviews!`);

  // Update consultant aggregate review metrics
  await Consultant.findByIdAndUpdate(createdConsultants[0]._id, {
    rating: 4.9,
    reviewCount: reviewsToInsert.length,
  });

  console.log('\n=========================================');
  console.log(' SEED COMPLETE — READY FOR DEMO');
  console.log(` 48 Reviews Seeded Successfully`);
  console.log(' Admin:      admin@consultflow.com / Admin@1234');
  console.log(' Client:     client@example.com / Client@1234');
  console.log(' Consultant: ashish.lichode@consultflow.org / Mentor@1234');
  console.log(' Promo Code: Engistud (Free for Students & Freshers)');
  console.log('=========================================\n');

  process.exit(0);
};

if (import.meta.main) {
  seedDatabase().catch((err) => {
    console.error('[Seed Failed]', err);
    process.exit(1);
  });
}
