const API_URL = 'https://customerfeedback-system-1.onrender.com/api/reviews';
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');


hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('active');
});

const form = document.getElementById('feedbackForm');
const feedbackList = document.getElementById('feedbackList');
const averageRating = document.getElementById('averageRating');
const feedbackSection = document.getElementById('feedbackSection'); // New feedback section container
const successMessage = document.getElementById('successMessage'); // Success message element

// Initially hide feedback list, average rating, and success message
feedbackList.style.display = 'none';
averageRating.style.display = 'none';
successMessage.style.display = 'none';

// Check if we are on the feedback list page or form page
const isFeedbackPage = window.location.pathname.includes('feedbacklist');

form.addEventListener('submit', async (e) => {
    e.preventDefault();  // Prevent default form submission

    // Collect input data from the form
    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const feedback = document.getElementById('feedback').value.trim();
    const rating = parseInt(document.getElementById('rating').value, 10);

    // Validate input fields
    if (!username || !email || !feedback || isNaN(rating) || rating < 1 || rating > 5) {
        alert('All fields are required, and the rating must be a valid number between 1 and 5.');
        return;
    }

    // Validate email format
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    try {
        // Send a POST request to submit the feedback
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, feedback, rating }),
        });

        if (response.ok) {
            // Show success message on the form page
            if (!isFeedbackPage) {
                successMessage.textContent = 'Feedback submitted successfully!';
                successMessage.style.display = 'block';
                setTimeout(() => {
                    successMessage.style.display = 'none';
                }, 3000);
            }

            // Reset the form fields after successful submission
            form.reset();

            // Fetch reviews if we're on the feedback list page
            if (isFeedbackPage) {
                fetchReviews();
            }
        } else {
            const error = await response.json();
            console.error('Error submitting feedback:', error);
            alert('Failed to submit feedback. Please try again.');
        }
    } catch (error) {
        console.error('Submission error:', error);
        alert('There was an error submitting your feedback. Please try again.');
    }
});

// Fetch and display reviews from the API
async function fetchReviews() {
    try {
        const response = await fetch(API_URL);
        const reviews = await response.json();

        feedbackList.innerHTML = ''; // Clear the existing reviews

        let totalRating = 0;
        let reviewsCount = reviews.length;

        // If no reviews exist, display a message
        if (reviewsCount === 0) {
            feedbackList.innerHTML = '<p>No reviews yet. Be the first to leave feedback!</p>';
            averageRating.textContent = 'Average Rating: N/A';
            feedbackList.style.display = 'block';
            return;
        }

        // Loop through each review and create an HTML element for it
        reviews.forEach(({ username, email, feedback, rating }) => {
            totalRating += rating;
            const div = document.createElement('div');
            div.classList.add('feedback-item');
            div.innerHTML = `<h3>${username} (${email})</h3><p>${feedback}</p><strong>Rating: ${rating}</strong>`;
            feedbackList.appendChild(div);
        });

        // Calculate and display the average rating
        const avgRating = (totalRating / reviewsCount).toFixed(2);
        averageRating.textContent = `Average Rating: ${avgRating}`;
        feedbackList.style.display = 'block';
        averageRating.style.display = 'block';
    } catch (error) {
        console.error('Fetch error:', error);
        feedbackList.innerHTML = '<p>Error fetching reviews. Please try again later.</p>';
        feedbackList.style.display = 'block';
    }
}

// Initial fetch of reviews when on the feedback list page
if (isFeedbackPage) {
    fetchReviews();
}
