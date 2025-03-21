import cv2
import numpy as np
import matplotlib.pyplot as plt
from itertools import combinations

# Load the uploaded image
image_path = "example.png"
image = cv2.imread(image_path)

# Convert to grayscale
gray = cv2.cvtColor(image, cv2.  COLOR_BGR2GRAY)

# Apply threshold to isolate the black shape
_, thresh = cv2.threshold(gray, 50, 255, cv2.THRESH_BINARY_INV)

# Create a copy of the image to draw on
result = image.copy()

# Find contours of the black shape
contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
largest_contour = max(contours, key=cv2.contourArea)

# Get bounding rectangle of contour for reference
x, y, w, h = cv2.boundingRect(largest_contour)

# Create a mask to test if points are inside the contour
mask = np.zeros_like(gray)
cv2.drawContours(mask, [largest_contour], 0, 255, -1)

def point_inside_contour(point):
    return mask[point[1], point[0]] > 0

def find_maximum_rectangle(contour, mask):
    # Create grid of sample points inside the contour
    grid_step = 5  # Lower value = more accurate but slower
    
    # Get contour bounding box for efficient sampling
    x, y, w, h = cv2.boundingRect(contour)
    
    # Collect points inside the contour
    points_inside = []
    for px in range(x, x+w, grid_step):
        for py in range(y, y+h, grid_step):
            if px < mask.shape[1] and py < mask.shape[0] and mask[py, px] > 0:
                points_inside.append((px, py))
    
    if not points_inside:
        return None
    
    best_rect = None
    max_area = 0
    
    # Convert points to numpy array for vectorized operations
    points = np.array(points_inside)
    
    # Find min/max x and y coordinates to limit search
    min_x, min_y = points.min(axis=0)
    max_x, max_y = points.max(axis=0)
    
    # Try different starting points for the rectangle
    for x1 in range(min_x, max_x, grid_step*2):
        for y1 in range(min_y, max_y, grid_step*2):
            if not point_inside_contour((x1, y1)):
                continue
                
            # For each valid starting point, try to grow rectangle
            for x2 in range(max_x, x1, -grid_step*2):
                # Test if top-right corner is inside
                if not point_inside_contour((x2, y1)):
                    continue
                    
                # Test horizontal line
                line_valid = True
                for px in range(x1, x2, grid_step):
                    if not point_inside_contour((px, y1)):
                        line_valid = False
                        break
                if not line_valid:
                    continue
                
                # Try extending downward
                for y2 in range(max_y, y1, -grid_step*2):
                    # Check if all corners are inside
                    if (not point_inside_contour((x1, y2)) or 
                        not point_inside_contour((x2, y2))):
                        continue
                    
                    # Check vertical lines
                    vert_valid = True
                    for py in range(y1, y2, grid_step):
                        if (not point_inside_contour((x1, py)) or 
                            not point_inside_contour((x2, py))):
                            vert_valid = False
                            break
                    if not vert_valid:
                        continue
                    
                    # Check bottom horizontal line
                    bottom_valid = True
                    for px in range(x1, x2, grid_step):
                        if not point_inside_contour((px, y2)):
                            bottom_valid = False
                            break
                    if not bottom_valid:
                        continue
                    
                    # If we get here, we have a valid rectangle
                    area = (x2 - x1) * (y2 - y1)
                    if area > max_area:
                        max_area = area
                        best_rect = [(x1, y1), (x2, y2)]
                        break  # Found valid rectangle for this row
    
    return best_rect

# Find the largest rectangle inside the contour
rectangle = find_maximum_rectangle(largest_contour, mask)

# Draw the predicted rectangle with green lines
if rectangle:
    (x1, y1), (x2, y2) = rectangle
    
    # Draw the four sides of the rectangle in green
    cv2.line(result, (x1, y1), (x2, y1), (0, 255, 0), 2)  # Top line
    cv2.line(result, (x1, y1), (x1, y2), (0, 255, 0), 2)  # Left line
    cv2.line(result, (x2, y1), (x2, y2), (0, 255, 0), 2)  # Right line
    cv2.line(result, (x1, y2), (x2, y2), (0, 255, 0), 2)  # Bottom line
    
    # Print rectangle info
    print(f"Rectangle found: Top-left: ({x1}, {y1}), Bottom-right: ({x2}, {y2})")
    print(f"Width: {x2-x1}, Height: {y2-y1}, Area: {(x2-x1)*(y2-y1)}")
else:
    print("No rectangle found")

# Convert the result image to RGB for displaying with matplotlib
result_rgb = cv2.cvtColor(result, cv2.COLOR_BGR2RGB)

# Display the original and result images side by side
plt.figure(figsize=(12, 6))
plt.subplot(1, 2, 1)
plt.imshow(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
plt.title("Original Image")
plt.axis("off")

plt.subplot(1, 2, 2)
plt.imshow(result_rgb)
plt.title("Optimized Rectangle Prediction")
plt.axis("off")

plt.tight_layout()
plt.show()