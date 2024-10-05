import React from "react";
import { Box, Image, Text, SimpleGrid, Link, HStack } from "@chakra-ui/react";
import { EmailIcon } from "@chakra-ui/icons";
import { FaLinkedin, FaGithub, FaBehance } from "react-icons/fa";
import member1 from "../assets/member1.jpg";
import member2 from "../assets/member2.jpg";
import member3 from "../assets/member3.jpg";
import member4 from "../assets/member4.jpg";
import member5 from "../assets/member5.jpg";
import member6 from "../assets/member6.jpg";

const TeamMember = ({
  name,
  role,
  photo,
  linkedin,
  github,
  behance,
  email,
}) => (
  <Box
    borderWidth="1px"
    borderRadius="lg"
    overflow="hidden"
    p={4}
    textAlign="center"
  >
    <Image
      src={photo}
      alt={name}
      borderRadius="full"
      boxSize="150px"
      mx="auto"
      mb={4}
    />
    <Text fontWeight="bold" fontSize="xl">
      {name}
    </Text>
    <Text color="gray.600" mb={2}>
      {role}
    </Text>
    <HStack spacing={4} justify="center">
      {linkedin && (
        <Link href={linkedin} isExternal>
          <FaLinkedin size="24px" color="#0077B5" />
        </Link>
      )}
      {github && (
        <Link href={github} isExternal>
          <FaGithub size="24px" color="#333" />
        </Link>
      )}
      {behance && (
        <Link href={behance} isExternal>
          <FaBehance size="24px" color="#1769FF" />
        </Link>
      )}
      {email && (
        <Link href={`mailto:${email}`}>
          <EmailIcon w={6} h={6} color="red.500" />
        </Link>
      )}
    </HStack>
  </Box>
);

const TeamMemberCards = () => {
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

  return (
    <SimpleGrid columns={[1, 2, 3]} spacing={8} mt={8} w="100%" pb="80px">
      {teamMembers.map((member, index) => (
        <TeamMember key={index} {...member} />
      ))}
    </SimpleGrid>
  );
};

export default TeamMemberCards;
