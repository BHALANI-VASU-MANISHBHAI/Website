import { Box, Typography, Paper, Divider, Link, useTheme, useMediaQuery } from "@mui/material";
import Title from "../components/Title";
import { PrivacyTip, Security, Cookie, Email, Settings } from "@mui/icons-material";

const PrivacyPolicy = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Gray color palette
  const grayPalette = {
    primary: '#6b7280', // Gray-500
    dark: '#374151',    // Gray-700
    light: '#9ca3af'    // Gray-400
  };

  const sectionData = [
    {
      title: "Information We Collect",
      content: "We may collect personal information such as your name, email address, and browsing behavior to improve your experience.",
      icon: <PrivacyTip sx={{ color: grayPalette.primary }} fontSize={isSmallScreen ? "medium" : "large"} />
    },
    {
      title: "How We Use Information",
      content: "Your information helps us provide better services, personalize content, and communicate important updates.",
      icon: <Settings sx={{ color: grayPalette.primary }} fontSize={isSmallScreen ? "medium" : "large"} />
    },
    {
      title: "Data Security",
      content: "We implement security measures to protect your data from unauthorized access or disclosure.",
      icon: <Security sx={{ color: grayPalette.primary }} fontSize={isSmallScreen ? "medium" : "large"} />
    },
    {
      title: "Cookies",
      content: "We use cookies to analyze site traffic and customize your experience.",
      icon: <Cookie sx={{ color: grayPalette.dark }} fontSize={isSmallScreen ? "medium" : "large"} />,
      // Special styling for Cookies section
      titleStyle: { color: grayPalette.dark, fontWeight: 700 }
    },
    {
      title: "Your Choices",
      content: "You can choose not to provide certain information, but this may limit your use of some features.",
      icon: <Settings sx={{ color: grayPalette.primary }} fontSize={isSmallScreen ? "medium" : "large"} />
    }
  ];

  return (
    <Box sx={{
      maxWidth: "900px",
      margin: "40px auto",
      padding: { xs: "0 16px", md: "0 40px" },
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      lineHeight: "1.6",
      color: "#4b5563" // Gray-600 for main text
    }}>
      <Box sx={{ textAlign: "center", mb: isSmallScreen ? 4 : 6 }}>
        <div className="inline-flex items-center mb-3 gap-2">
          <Title className={isSmallScreen ? "text-xl font-medium" : "text-2xl font-medium"} 
                text1={"PRIVACY"} text2={"POLICY"} 
                textColor={grayPalette.dark} />
        </div>
        <Typography variant="subtitle1" sx={{ 
          color: grayPalette.primary, 
          maxWidth: "700px", 
          margin: "0 auto",
          mt: 2,
          fontSize: isSmallScreen ? '0.875rem' : '1rem'
        }}>
          Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ 
        padding: isSmallScreen ? "16px" : "30px",
        borderRadius: "12px",
        backgroundColor: "#f9fafb" // Gray-50 background
      }}>
        <Typography variant="body1" paragraph sx={{ 
          fontSize: isSmallScreen ? '0.9375rem' : '1.1rem', 
          mb: isSmallScreen ? 2 : 3,
          color: grayPalette.dark
        }}>
          Your privacy is important to us. This privacy policy explains how we collect, use, and protect your personal information when you use our website.
        </Typography>

        <Divider sx={{ my: isSmallScreen ? 2 : 3, borderColor: grayPalette.light }} />

        {sectionData.map((section, index) => (
          <Box key={index} sx={{ mb: isSmallScreen ? 3 : 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              {section.icon}
              <Typography variant="h5" component="h2" sx={{ 
                ml: 2,
                fontWeight: "600",
                color: section.titleStyle?.color || grayPalette.primary,
                fontSize: isSmallScreen ? '1.1rem' : '1.25rem',
                ...section.titleStyle
              }}>
                {section.title}
              </Typography>
            </Box>
            <Typography variant="body1" paragraph sx={{ 
              fontSize: isSmallScreen ? '0.9375rem' : '1.05rem',
              pl: isSmallScreen ? 4 : 6,
              color: grayPalette.dark
            }}>
              {section.content}
            </Typography>
          </Box>
        ))}

        <Divider sx={{ my: isSmallScreen ? 2 : 3, borderColor: grayPalette.light }} />

        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Email sx={{ color: grayPalette.primary }} fontSize={isSmallScreen ? "medium" : "large"} />
          <Typography variant="h5" component="h2" sx={{ 
            ml: 2,
            fontWeight: "600",
            color: grayPalette.primary,
            fontSize: isSmallScreen ? '1.1rem' : '1.25rem'
          }}>
            Contact Us
          </Typography>
        </Box>
        <Typography variant="body1" paragraph sx={{ 
          fontSize: isSmallScreen ? '0.9375rem' : '1.05rem',
          pl: isSmallScreen ? 4 : 6,
          mt: 1,
          color: grayPalette.dark
        }}>
          If you have questions about this policy, please contact us at{" "}
          <Link href="mailto:privacy@example.com" sx={{ color: grayPalette.dark, textDecorationColor: grayPalette.dark }}>
            privacy@example.com
          </Link>.
        </Typography>
      </Paper>

      <Typography variant="body2" sx={{ 
        textAlign: "center",
        mt: isSmallScreen ? 3 : 4,
        color: grayPalette.primary,
        fontSize: isSmallScreen ? '0.75rem' : '0.875rem'
      }}>
        © {new Date().getFullYear()} Forever. All rights reserved.
      </Typography>
    </Box>
  );
};

export default PrivacyPolicy;