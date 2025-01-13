import React from "react";
import member1 from "../assets/member1.jpg";
import member2 from "../assets/member2.jpg";
import member3 from "../assets/member3.jpg";
import member4 from "../assets/member4.jpg";
import member5 from "../assets/member5.jpg";
import member6 from "../assets/member6.jpg";
import TeamMember from './TeamMember';

const teamMembers = [
  {
    name: "Raghad Mahmoud",
    role: "UI/UX Designer",
    photo: member4,
    linkedin: "https://www.linkedin.com/in/raghad-mahmoud-00a48b2a4/",
    behance: "https://www.behance.net/raghadmahmoud9",
    email: "Raghadmahmoud301@gmail.com",
  },
  {
    name: "Basma Sabry Elhussieni",
    role: "Backend and Data Analyzer",
    photo: member6,
    linkedin: "https://www.linkedin.com/in/basma-sabry-084092248/",
    github: "https://github.com/Basma-90",
  },
  {
    name: "Mohamed Ahmed Badry",
    role: "Backend and Data Analyzer",
    photo: member3,
    linkedin: "https://www.linkedin.com/in/mohamed-badry-205097220/",
  },
  {
    name: "Abd Elhadi Elsayed",
    role: "Video Editor, Data Collection",
    photo: member2,
    email: "a.enghadi26@gmail.com",
  },
  {
    name: "Salma Saad",
    role: "Team Leader",
    photo: member1,
    linkedin: "https://www.linkedin.com/in/salma-saad-255903204/",
    email: "salmasaad2131@gmail.com",
  },
  {
    name: "Ahmed Khaled Fathi",
    role: "Frontend Developer",
    photo: member5,
    github: "https://github.com/AhmedKhaledp-0",
    email: "brokeninfp@gmail.com",
  },
];

export default function TeamMemberCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {teamMembers.map((member, index) => (
        <TeamMember 
          key={index} 
          {...member}
          photo={member.photo} 
        />
      ))}
    </div>
  );
}
