// resources.js
document.addEventListener('DOMContentLoaded', function() {
    // Initialize articles data
    const articles = {
        'mindful-breathing': {
            title: 'Mindful Breathing Techniques',
            content: `
                <h3>What is Mindful Breathing?</h3>
                <p>Mindful breathing is a simple yet powerful technique that helps you focus on your breath, bringing your attention to the present moment. It's an effective way to reduce stress, anxiety, and overwhelming emotions.</p>
                
                <h3>Basic Breathing Exercise</h3>
                <p><strong>Try the 4-7-8 technique:</strong></p>
                <ol>
                    <li>Find a comfortable seated position</li>
                    <li>Close your eyes and inhale through your nose for 4 seconds</li>
                    <li>Hold your breath for 7 seconds</li>
                    <li>Exhale slowly through your mouth for 8 seconds</li>
                    <li>Repeat 4-5 times</li>
                </ol>
                
                <h3>Benefits of Mindful Breathing</h3>
                <ul>
                    <li>Reduces stress hormone levels</li>
                    <li>Lowers blood pressure</li>
                    <li>Improves focus and concentration</li>
                    <li>Promotes relaxation</li>
                    <li>Helps manage anxiety symptoms</li>
                </ul>
                
                <h3>When to Practice</h3>
                <p>You can practice mindful breathing anytime, anywhere. Try incorporating it into your daily routine:</p>
                <ul>
                    <li>Morning: Start your day with 5 minutes of breathing</li>
                    <li>During breaks: Take 1-2 minutes to breathe deeply</li>
                    <li>Before bed: Relax with gentle breathing exercises</li>
                    <li>During stressful moments: Use it as a quick reset</li>
                </ul>
            `
        },
        'study-strategies': {
            title: 'Effective Study Strategies',
            content: `
                <h3>The Pomodoro Technique</h3>
                <p>Break your study time into manageable chunks:</p>
                <ul>
                    <li>Study for 25 minutes</li>
                    <li>Take a 5-minute break</li>
                    <li>After 4 cycles, take a longer 15-30 minute break</li>
                </ul>
                
                <h3>Active Learning Methods</h3>
                <p><strong>Instead of passive reading, try:</strong></p>
                <ul>
                    <li><strong>Teaching:</strong> Explain concepts to someone else (or to yourself)</li>
                    <li><strong>Mind Mapping:</strong> Create visual diagrams of information</li>
                    <li><strong>Practice Testing:</strong> Test yourself regularly</li>
                    <li><strong>Spaced Repetition:</strong> Review material over increasing intervals</li>
                </ul>
                
                <h3>Creating an Effective Study Environment</h3>
                <ul>
                    <li>Find a quiet, well-lit space</li>
                    <li>Minimize distractions (phone, social media)</li>
                    <li>Have all materials ready before starting</li>
                    <li>Keep water and healthy snacks nearby</li>
                </ul>
                
                <h3>Managing Study Load</h3>
                <p><strong>Tips to avoid overwhelm:</strong></p>
                <ul>
                    <li>Break large projects into smaller tasks</li>
                    <li>Prioritize assignments by due date and importance</li>
                    <li>Schedule regular breaks</li>
                    <li>Don't try to memorize everything at once</li>
                    <li>Get enough sleep for memory consolidation</li>
                </ul>
            `
        },
        'healthy-relationships': {
            title: 'Building Healthy Friendships',
            content: `
                <h3>Qualities of Healthy Friendships</h3>
                <ul>
                    <li><strong>Mutual Respect:</strong> Valuing each other's boundaries and opinions</li>
                    <li><strong>Trust:</strong> Feeling safe to be yourself</li>
                    <li><strong>Support:</strong> Being there during both good and challenging times</li>
                    <li><strong>Honesty:</strong> Communicating openly and truthfully</li>
                    <li><strong>Balance:</strong> Giving and receiving in equal measure</li>
                </ul>
                
                <h3>Communication Tips</h3>
                <p><strong>Effective communication includes:</strong></p>
                <ul>
                    <li>Active listening (focus on understanding, not just responding)</li>
                    <li>Using "I" statements ("I feel..." instead of "You always...")</li>
                    <li>Expressing appreciation regularly</li>
                    <li>Addressing issues calmly and respectfully</li>
                    <li>Being open to feedback</li>
                </ul>
                
                <h3>Setting Boundaries</h3>
                <p><strong>Healthy boundaries protect your well-being:</strong></p>
                <ul>
                    <li>Learn to say "no" without guilt</li>
                    <li>Communicate your needs clearly</li>
                    <li>Respect others' boundaries</li>
                    <li>Take time for yourself when needed</li>
                    <li>Recognize when a friendship becomes unhealthy</li>
                </ul>
                
                <h3>Resolving Conflicts</h3>
                <p><strong>Conflict is normal - here's how to handle it:</strong></p>
                <ol>
                    <li>Take a break if emotions are high</li>
                    <li>Listen to understand the other person's perspective</li>
                    <li>Express your feelings without blame</li>
                    <li>Look for compromise solutions</li>
                    <li>Agree to disagree when necessary</li>
                </ol>
            `
        },
        'grounding-techniques': {
            title: 'Grounding Techniques for Anxiety',
            content: `
                <h3>What is Grounding?</h3>
                <p>Grounding techniques help bring you back to the present moment when you feel anxious, overwhelmed, or disconnected. They use your senses to anchor you in the here and now.</p>
                
                <h3>The 5-4-3-2-1 Technique</h3>
                <p><strong>This simple exercise engages all your senses:</strong></p>
                <ol>
                    <li><strong>5 things you can SEE:</strong> Look around and name five things you see</li>
                    <li><strong>4 things you can FEEL:</strong> Notice four things you can touch</li>
                    <li><strong>3 things you can HEAR:</strong> Listen for three distinct sounds</li>
                    <li><strong>2 things you can SMELL:</strong> Identify two scents around you</li>
                    <li><strong>1 thing you can TASTE:</strong> Notice the taste in your mouth or take a sip of water</li>
                </ol>
                
                <h3>Physical Grounding Techniques</h3>
                <ul>
                    <li><strong>Deep Pressure:</strong> Hug yourself tightly or use a weighted blanket</li>
                    <li><strong>Temperature Change:</strong> Hold an ice cube or splash cold water on your face</li>
                    <li><strong>Mindful Movement:</strong> Stretch slowly, noticing each muscle</li>
                    <li><strong>Focus on Breath:</strong> Count your breaths or trace their path in your body</li>
                </ul>
                
                <h3>Mental Grounding Exercises</h3>
                <ul>
                    <li>Name all the colors you see in the room</li>
                    <li>Count backward from 100 by 7s</li>
                    <li>List your favorite movies, books, or foods</li>
                    <li>Describe an everyday object in extreme detail</li>
                    <li>Recall a happy memory in vivid detail</li>
                </ul>
                
                <h3>When to Use Grounding</h3>
                <p>These techniques are helpful when you experience:</p>
                <ul>
                    <li>Panic attacks or anxiety spikes</li>
                    <li>Flashbacks or intrusive thoughts</li>
                    <li>Dissociation or feeling "spaced out"</li>
                    <li>Overwhelming emotions</li>
                    <li>Stress at work or school</li>
                </ul>
            `
        },
        'time-management': {
            title: 'Time Management for Students',
            content: `
                <h3>The Eisenhower Matrix</h3>
                <p>Prioritize tasks based on urgency and importance:</p>
                <ul>
                    <li><strong>Urgent & Important:</strong> Do these immediately (deadlines, emergencies)</li>
                    <li><strong>Important but Not Urgent:</strong> Schedule these (long-term projects, studying)</li>
                    <li><strong>Urgent but Not Important:</strong> Delegate or minimize (some emails, interruptions)</li>
                    <li><strong>Neither Urgent nor Important:</strong> Eliminate or limit (excessive social media, distractions)</li>
                </ul>
                
                <h3>Creating an Effective Schedule</h3>
                <p><strong>Tips for better scheduling:</strong></p>
                <ul>
                    <li>Use a planner or digital calendar consistently</li>
                    <li>Block time for specific tasks (time blocking)</li>
                    <li>Schedule breaks and self-care</li>
                    <li>Be realistic about how long tasks take</li>
                    <li>Include buffer time between activities</li>
                </ul>
                
                <h3>Overcoming Procrastination</h3>
                <p><strong>Strategies to get started:</strong></p>
                <ul>
                    <li><strong>The 5-Minute Rule:</strong> Commit to working for just 5 minutes</li>
                    <li><strong>Break it Down:</strong> Divide large tasks into tiny steps</li>
                    <li><strong>Eliminate Distractions:</strong> Use website blockers during study time</li>
                    <li><strong>Reward Yourself:</strong> Plan small rewards after completing tasks</li>
                    <li><strong>Focus on Progress, Not Perfection:</strong> Done is better than perfect</li>
                </ul>
                
                <h3>Balancing School and Life</h3>
                <ul>
                    <li><strong>Protect Your Sleep:</strong> Aim for 7-9 hours nightly</li>
                    <li><strong>Schedule Downtime:</strong> Include hobbies and social time</li>
                    <li><strong>Learn to Say No:</strong> Don't overcommit</li>
                    <li><strong>Meal Prep:</strong> Save time and eat healthier</li>
                    <li><strong>Weekly Review:</strong> Adjust your schedule based on what's working</li>
                </ul>
            `
        },
        'sleep-hygiene': {
            title: 'Improving Sleep Hygiene',
            content: `
                <h3>What is Sleep Hygiene?</h3>
                <p>Sleep hygiene refers to habits and practices that support consistent, uninterrupted, and restorative sleep. Good sleep is essential for mental and physical health.</p>
                
                <h3>Creating a Sleep-Friendly Environment</h3>
                <ul>
                    <li><strong>Darkness:</strong> Use blackout curtains or a sleep mask</li>
                    <li><strong>Temperature:</strong> Keep room cool (around 65°F/18°C)</li>
                    <li><strong>Quiet:</strong> Use white noise or earplugs if needed</li>
                    <li><strong>Comfort:</strong> Invest in a supportive mattress and pillows</li>
                    <li><strong>Reserve for Sleep:</strong> Use bed only for sleep and intimacy</li>
                </ul>
                
                <h3>Pre-Bedtime Routine</h3>
                <p><strong>Wind down 60 minutes before bed:</strong></p>
                <ol>
                    <li>Dim lights and avoid bright screens</li>
                    <li>Take a warm bath or shower</li>
                    <li>Practice gentle stretching or meditation</li>
                    <li>Read a physical book (not on a screen)</li>
                    <li>Write in a journal to clear your mind</li>
                </ol>
                
                <h3>Daytime Habits for Better Sleep</h3>
                <ul>
                    <li>Get morning sunlight exposure</li>
                    <li>Exercise regularly, but not too close to bedtime</li>
                    <li>Limit caffeine after 2 PM</li>
                    <li>Avoid large meals before bed</li>
                    <li>Limit naps to 20-30 minutes, and not after 3 PM</li>
                </ul>
                
                <h3>Managing Sleep Anxiety</h3>
                <p><strong>If you can't sleep:</strong></p>
                <ul>
                    <li>Get out of bed after 20 minutes</li>
                    <li>Do a quiet, relaxing activity in dim light</li>
                    <li>Practice deep breathing or progressive muscle relaxation</li>
                    <li>Write down worries to address them tomorrow</li>
                    <li>Remember that rest is still beneficial even if you're not asleep</li>
                </ul>
            `
        },
        'workplace-stress': {
            title: 'Managing Workplace Stress',
            content: `
                <h3>Identifying Workplace Stressors</h3>
                <p><strong>Common sources of work stress include:</strong></p>
                <ul>
                    <li>Heavy workload or tight deadlines</li>
                    <li>Lack of control over work decisions</li>
                    <li>Unclear job expectations</li>
                    <li>Poor work-life balance</li>
                    <li>Difficult relationships with colleagues or managers</li>
                    <li>Job insecurity</li>
                </ul>
                
                <h3>Setting Healthy Boundaries at Work</h3>
                <ul>
                    <li>Communicate your working hours clearly</li>
                    <li>Take regular breaks throughout the day</li>
                    <li>Learn to prioritize tasks effectively</li>
                    <li>Say "no" to unreasonable demands respectfully</li>
                    <li>Disconnect from work emails after hours</li>
                    <li>Use your vacation time</li>
                </ul>
                
                <h3>Stress Reduction Techniques During Work</h3>
                <p><strong>Quick strategies to use at your desk:</strong></p>
                <ul>
                    <li><strong>Micro-breaks:</strong> Take 1-2 minutes every hour to stretch or breathe</li>
                    <li><strong>Desk stretches:</strong> Simple stretches to relieve tension</li>
                    <li><strong>Mindful moments:</strong> Focus on your senses for 30 seconds</li>
                    <li><strong>Hydration breaks:</strong> Get up to get water regularly</li>
                    <li><strong>Positive self-talk:</strong> Replace negative thoughts with encouraging ones</li>
                </ul>
                
                <h3>Creating a Supportive Work Environment</h3>
                <ul>
                    <li>Organize your workspace to reduce clutter</li>
                    <li>Add personal touches (plants, photos)</li>
                    <li>Use headphones with calming music if needed</li>
                    <li>Take walking meetings when possible</li>
                    <li>Build positive relationships with colleagues</li>
                    <li>Seek support from HR if needed</li>
                </ul>
            `
        },
        'family-dynamics': {
            title: 'Navigating Family Relationships',
            content: `
                <h3>Understanding Family Roles and Patterns</h3>
                <p>Every family has its unique dynamics. Recognizing these patterns can help you navigate relationships more effectively:</p>
                <ul>
                    <li><strong>Communication Styles:</strong> How your family expresses emotions and resolves conflicts</li>
                    <li><strong>Boundaries:</strong> Understanding where one person ends and another begins</li>
                    <li><strong>Roles:</strong> The unofficial positions family members take (peacemaker, caretaker, etc.)</li>
                    <li><strong>Expectations:</strong> Unspoken rules about behavior and achievement</li>
                </ul>
                
                <h3>Setting Healthy Family Boundaries</h3>
                <p><strong>Boundaries protect your well-being while maintaining relationships:</strong></p>
                <ul>
                    <li><strong>Physical Boundaries:</strong> Personal space and privacy needs</li>
                    <li><strong>Emotional Boundaries:</strong> Separating your feelings from others'</li>
                    <li><strong>Time Boundaries:</strong> Balancing family time with personal needs</li>
                    <li><strong>Financial Boundaries:</strong> Clear expectations about money</li>
                    <li><strong>Communicate Clearly:</strong> Express your boundaries respectfully but firmly</li>
                </ul>
                
                <h3>Communication Strategies for Difficult Conversations</h3>
                <ol>
                    <li><strong>Choose the right time:</strong> Don't bring up issues during stressful moments</li>
                    <li><strong>Use "I" statements:</strong> "I feel..." instead of "You always..."</li>
                    <li><strong>Listen actively:</strong> Try to understand their perspective</li>
                    <li><strong>Stay calm:</strong> Take breaks if emotions run high</li>
                    <li><strong>Focus on solutions:</strong> What can change moving forward?</li>
                </ol>
                
                <h3>Self-Care Within Family Systems</h3>
                <p><strong>Taking care of yourself while maintaining family connections:</strong></p>
                <ul>
                    <li>Schedule regular "me time" without guilt</li>
                    <li>Develop support systems outside the family</li>
                    <li>Practice stress-reduction techniques</li>
                    <li>Set realistic expectations for family interactions</li>
                    <li>Seek professional support if needed (family therapy)</li>
                    <li>Remember you can love family members while maintaining boundaries</li>
                </ul>
            `
        }
    };

    // Initialize filter functionality
    initializeFilters();
    
    // Initialize article modal functionality
    initializeArticleModal();
    
    // Initialize resource form functionality
    initializeResourceForm();
    
    // Initialize helpline search
    initializeHelplineSearch();
    
    // Initialize cat mascot
    initializeCatMascot();

    // Filter functionality
    function initializeFilters() {
        const filterButtons = document.querySelectorAll('.tag-filter');
        const resourceCards = document.querySelectorAll('.resource-card');
        
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Update active button
                filterButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
                
                const filter = this.getAttribute('data-tag');
                
                // Filter resources
                resourceCards.forEach(card => {
                    const tags = card.getAttribute('data-tags').split(',');
                    
                    if (filter === 'all' || tags.includes(filter)) {
                        card.style.display = 'block';
                        setTimeout(() => {
                            card.style.opacity = '1';
                            card.style.transform = 'translateY(0)';
                        }, 10);
                    } else {
                        card.style.opacity = '0';
                        card.style.transform = 'translateY(10px)';
                        setTimeout(() => {
                            card.style.display = 'none';
                        }, 300);
                    }
                });
            });
        });
    }

    // Article modal functionality
    function initializeArticleModal() {
        const modal = document.getElementById('article-modal');
        const closeModal = document.querySelector('.close-modal');
        const articleLinks = document.querySelectorAll('.resource-link[data-article]');
        
        articleLinks.forEach(link => {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                const articleId = this.getAttribute('data-article');
                
                if (articles[articleId]) {
                    document.getElementById('article-title').textContent = articles[articleId].title;
                    document.getElementById('article-body').innerHTML = articles[articleId].content;
                    modal.style.display = 'block';
                }
            });
        });
        
        closeModal.addEventListener('click', function() {
            modal.style.display = 'none';
        });
        
        window.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }

    // Resource form functionality
    function initializeResourceForm() {
        const addResourceBtn = document.getElementById('add-resource-btn');
        const resourceForm = document.getElementById('resource-form');
        const cancelResourceBtn = document.getElementById('cancel-resource');
        const submitResourceBtn = document.getElementById('submit-resource');
        const newResourceForm = document.getElementById('new-resource-form');
        const tagSelectors = document.querySelectorAll('.tag-selector');
        
        let selectedTags = [];
        
        // Toggle tag selection
        tagSelectors.forEach(tag => {
            tag.addEventListener('click', function() {
                const tagValue = this.getAttribute('data-tag');
                
                if (this.classList.contains('selected')) {
                    this.classList.remove('selected');
                    selectedTags = selectedTags.filter(t => t !== tagValue);
                } else {
                    this.classList.add('selected');
                    selectedTags.push(tagValue);
                }
            });
        });
        
        // Show form
        addResourceBtn.addEventListener('click', function() {
            resourceForm.style.display = 'block';
            addResourceBtn.style.display = 'none';
            window.scrollTo({
                top: resourceForm.offsetTop - 50,
                behavior: 'smooth'
            });
        });
        
        // Hide form
        cancelResourceBtn.addEventListener('click', function() {
            resourceForm.style.display = 'none';
            addResourceBtn.style.display = 'inline-block';
            newResourceForm.reset();
            tagSelectors.forEach(tag => tag.classList.remove('selected'));
            selectedTags = [];
        });
        
        // Submit form
        newResourceForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('resource-title').value;
            const description = document.getElementById('resource-description').value;
            const content = document.getElementById('resource-content').value;
            
            if (selectedTags.length === 0) {
                alert('Please select at least one tag');
                return;
            }
            
            // In a real app, you would save this to a database
            console.log('New resource submitted:', {
                title,
                description,
                content,
                tags: selectedTags
            });
            
            alert('Resource submitted! (In a real app, this would be saved to the database)');
            
            // Reset form
            newResourceForm.reset();
            tagSelectors.forEach(tag => tag.classList.remove('selected'));
            selectedTags = [];
            resourceForm.style.display = 'none';
            addResourceBtn.style.display = 'inline-block';
        });
    }

    // Helpline search functionality
    function initializeHelplineSearch() {
        const searchBtn = document.getElementById('search-helpline');
        const countryInput = document.getElementById('country-search');
        const resultsDiv = document.getElementById('helpline-results');
        
        // Sample helpline data (in a real app, this would come from a database)
        const helplines = {
            'usa': 'National Suicide Prevention Lifeline: 988',
            'uk': 'Samaritans: 116 123',
            'canada': 'Crisis Services Canada: 1-833-456-4566',
            'australia': 'Lifeline: 13 11 14',
            'india': 'Vandrevala Foundation: 1860 266 2345',
            'general': 'International Association for Suicide Prevention: Find resources at <a href="https://www.iasp.info/resources/Crisis_Centres/" target="_blank">iasp.info</a>'
        };
        
        searchBtn.addEventListener('click', function() {
            const country = countryInput.value.trim().toLowerCase();
            
            if (!country) {
                resultsDiv.innerHTML = '<p style="color: #666;">Please enter a country name</p>';
                return;
            }
            
            let found = false;
            
            for (const [key, value] of Object.entries(helplines)) {
                if (country.includes(key) || key.includes(country)) {
                    resultsDiv.innerHTML = `<p><strong>${value}</strong></p>`;
                    found = true;
                    break;
                }
            }
            
            if (!found) {
                resultsDiv.innerHTML = `
                    <p>No specific helpline found for "${country}". Here are general resources:</p>
                    <p><strong>${helplines.general}</strong></p>
                    <p><em>If you're in crisis, please contact emergency services in your area.</em></p>
                `;
            }
        });
        
        // Allow pressing Enter to search
        countryInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }

    // Cat mascot functionality
    function initializeCatMascot() {
        const catMascot = document.querySelector('.cat-mascot img');
        const speechBubble = document.querySelector('.speech-bubble');
        const closeBubble = document.querySelector('.close-bubble');
        
        catMascot.addEventListener('click', function() {
            speechBubble.style.display = 'block';
        });
        
        closeBubble.addEventListener('click', function() {
            speechBubble.style.display = 'none';
        });
        
        // Auto-hide bubble after 10 seconds
        setTimeout(() => {
            speechBubble.style.display = 'none';
        }, 10000);
    }
});