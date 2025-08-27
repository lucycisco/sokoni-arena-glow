import { motion } from 'framer-motion';
import { Megaphone, Star, MessageCircle, Mail, FileText, Clock, DollarSign, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const AdvertiseSection = () => {
  const handleWhatsAppSubmission = () => {
    const message = `Hi Sokoni Arena! I want to advertise my product/service on your platform. Here are the details:

📦 Product/Service Name: [Your product name]
💰 Price: KSh [Your price]
📝 Description: [Brief description]
📍 Location: [Your location]
📱 Condition: [New/Used]
📞 Contact: [Your phone/WhatsApp]
📧 Email: [Your email]

Please let me know the next steps!`;
    
    window.open(`https://wa.me/254712345678?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleEmailSubmission = () => {
    const subject = 'Product/Service Advertisement Submission - Sokoni Arena';
    const body = `Dear Sokoni Arena Team,

I would like to advertise my product/service on your platform. Please find the details below:

Product/Service Information:
- Name: [Your product/service name]
- Price: KSh [Your price]
- Description: [Detailed description]
- Category: [Select category]
- Subcategory: [Select subcategory]
- Condition: [New/Used]
- Location: [Your location]

Seller Information:
- Name: [Your full name]
- Phone: [Your phone number]
- WhatsApp: [Your WhatsApp number]
- Email: [Your email address]

Additional Information:
- Images: [Please attach high-quality images]
- Special Features: [Any special features or benefits]

Please let me know the next steps for posting my ad.

Best regards,
[Your name]`;

    window.open(`mailto:ads@sokoniarena.co.ke?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_self');
  };

  const handleGoogleFormSubmission = () => {
    // This would be replaced with actual Google Form URL
    window.open('https://forms.google.com/sokoni-arena-submission', '_blank');
  };

  const requirements = [
    {
      icon: FileText,
      title: 'Product Details',
      description: 'Clear title, detailed description, accurate price'
    },
    {
      icon: Star,
      title: 'High-Quality Images',
      description: 'Multiple clear photos from different angles'
    },
    {
      icon: MessageCircle,
      title: 'Contact Information',
      description: 'Valid phone, WhatsApp, and email details'
    },
    {
      icon: Clock,
      title: 'Quick Approval',
      description: 'Most ads go live within 24 hours'
    }
  ];

  const benefits = [
    {
      icon: Zap,
      title: 'Instant Visibility',
      description: 'Get seen by thousands of potential buyers'
    },
    {
      icon: DollarSign,
      title: 'Boost Sales',
      description: 'Reach more customers across Kenya'
    },
    {
      icon: Star,
      title: 'Premium Placement',
      description: 'Hot Deals feature for maximum exposure'
    }
  ];

  return (
    <section id="advertise" className="py-20 bg-gradient-to-br from-light-purple/10 to-light-pink/10">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-6 py-3 bg-gradient-hot-deal rounded-full mb-6">
            <Megaphone className="w-6 h-6 mr-2 text-primary" />
            <span className="font-bold text-primary">Start Advertising</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold gradient-text mb-4">
            Ready to Sell on Sokoni Arena?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join thousands of successful sellers on Kenya's most beautiful marketplace. 
            It's now simplified and easier than ever!
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit.title}
              initial={{ scale: 0 }}
              whileInView={{ scale: 1 }}
              transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-gradient-hero rounded-full flex items-center justify-center mx-auto mb-4">
                <benefit.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">{benefit.title}</h3>
              <p className="text-muted-foreground">{benefit.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Main CTA Card */}
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <Card className="hot-deal-glow">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <h3 className="text-3xl font-bold gradient-text mb-4">
                  Got a Big Event, Party, or Service to Announce?
                </h3>
                <p className="text-lg text-muted-foreground">
                  Advertise on Sokoni Arena and reach thousands of potential customers!
                </p>
              </div>

              {/* Submission Methods */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                  <Button
                    onClick={handleWhatsAppSubmission}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-6 mb-4"
                  >
                    <MessageCircle className="w-6 h-6 mr-2" />
                    Submit via WhatsApp
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Quick and easy submission through WhatsApp
                  </p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                  <Button
                    onClick={handleEmailSubmission}
                    className="w-full btn-hero py-6 mb-4"
                  >
                    <Mail className="w-6 h-6 mr-2" />
                    Submit via Email
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Professional email submission with templates
                  </p>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                  <Button
                    onClick={handleGoogleFormSubmission}
                    className="w-full btn-hero-outline py-6 mb-4"
                  >
                    <FileText className="w-6 h-6 mr-2" />
                    Submit via Google Form
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    Structured form with file upload support
                  </p>
                </motion.div>
              </div>

              {/* Requirements */}
              <div className="border-t pt-8">
                <h4 className="text-xl font-bold text-center mb-6">What You Need to Provide:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {requirements.map((req, index) => (
                    <motion.div
                      key={req.title}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="text-center"
                    >
                      <div className="w-12 h-12 bg-accent/20 rounded-full flex items-center justify-center mx-auto mb-3">
                        <req.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h5 className="font-semibold text-foreground mb-2">{req.title}</h5>
                      <p className="text-sm text-muted-foreground">{req.description}</p>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Premium Ads Info */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                viewport={{ once: true }}
                className="bg-gradient-hot-deal p-6 rounded-xl mt-8 text-center"
              >
                <h4 className="text-xl font-bold text-primary mb-4">
                  Want Premium Hot Deals Placement?
                </h4>
                <p className="text-muted-foreground mb-4">
                  Get maximum visibility with our Hot Deals feature. Pay via M-Pesa for instant premium placement!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <div className="bg-white/50 px-4 py-2 rounded-lg">
                    <span className="font-semibold">7 Days: KSh 500</span>
                  </div>
                  <div className="bg-white/50 px-4 py-2 rounded-lg">
                    <span className="font-semibold">14 Days: KSh 800</span>
                  </div>
                  <div className="bg-white/50 px-4 py-2 rounded-lg">
                    <span className="font-semibold">30 Days: KSh 1,200</span>
                  </div>
                </div>
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
};

export default AdvertiseSection;