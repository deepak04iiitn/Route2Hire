# DSA Leaderboard System - Complete Documentation

## Overview

The DSA Leaderboard System is a comprehensive ranking mechanism that tracks user progress on Data Structures and Algorithms problems. It provides real-time rankings, points-based scoring, weekly competitions, and automatic updates without requiring page refresh.

---

## Table of Contents

1. [Points System](#1-points-system)
2. [Ranking Algorithm](#2-ranking-algorithm)
3. [Time Periods](#3-time-periods)
4. [Weekly Winners](#4-weekly-winners)
5. [Real-Time Updates](#5-real-time-updates)
6. [Complete Data Flow](#6-complete-data-flow)
7. [Search Functionality](#7-search-functionality)
8. [Performance Optimizations](#8-performance-optimizations)
9. [User Experience Flow](#9-user-experience-flow)
10. [Technical Architecture](#10-technical-architecture)
11. [Edge Cases](#11-edge-cases)

---

## 1. Points System

### How Points Are Awarded

The leaderboard uses a difficulty-based points system:

- **Easy Problems**: 10 points each
- **Medium Problems**: 20 points each  
- **Hard Problems**: 30 points each

### Points Calculation Logic

When a user marks a problem as completed:

1. The system records the completion with a timestamp
2. It retrieves the problem's difficulty level (Easy, Medium, or Hard)
3. Points are automatically added to the user's total based on the difficulty
4. The total points are the sum of all completed problems

**Example Calculation:**
- User completes: 5 Easy problems (5 × 10 = 50 points)
- User completes: 3 Medium problems (3 × 20 = 60 points)
- User completes: 2 Hard problems (2 × 30 = 60 points)
- **Total Points**: 170 points

### Design Rationale

- **Encourages Harder Problems**: Hard problems give 3x more points than Easy problems
- **Fair Distribution**: Medium problems are worth 2x Easy problems
- **Incentivizes Progress**: Users are motivated to tackle more challenging problems

---

## 2. Ranking Algorithm

### Ranking Criteria (Priority Order)

Users are ranked using a multi-level sorting system:

1. **Total Points** (Primary) - Highest points rank higher
2. **Completed Count** (Secondary) - If points are equal, more completed problems rank higher
3. **Last Completion Time** (Tertiary) - If points and count are equal, most recent completion ranks higher
4. **User ID** (Final Tie-Breaker) - Unique MongoDB identifier ensures no two users can have the same rank

### Why This Ensures Unique Ranks

Even if two users have:
- Identical points
- Identical completed count
- Identical last completion time

The User ID (which is globally unique) will break the tie, ensuring every user has a distinct rank.

### Rank Assignment Process

1. **Calculate Metrics**: System calculates all users' points, completed count, and last completion time
2. **Sort by Criteria**: Users are sorted using the four-level criteria system
3. **Assign Sequential Ranks**: After sorting, ranks are assigned sequentially (1, 2, 3, 4...)
4. **Display Top N**: Only top N users are displayed (default: 10, expandable)

### Deterministic Ranking

- Rankings are **deterministic** - given the same data, rankings will always be the same
- No random elements or ambiguous ties
- Consistent and predictable results

---

## 3. Time Periods

### Weekly Rankings

**Week Definition:**
- Week starts: Monday 00:00:00 UTC
- Week ends: Sunday 23:59:59 UTC

**Calculation Logic:**
- System calculates the most recent Monday (or today if it's Monday)
- Sets the time to exactly 00:00:00 UTC
- This becomes the "start of the current week"

**Filtering Process:**
- Only includes problems completed on or after the calculated Monday
- Problems completed before Monday are excluded from weekly rankings
- All-Time rankings remain unaffected

**Reset Cycle:**
- Automatically resets every Monday at 00:00 UTC
- Previous week's data is archived
- New week starts with fresh rankings

### All-Time Rankings

**Definition:**
- Includes ALL completed problems from the beginning of time
- No date filtering applied
- Cumulative lifetime progress

**Characteristics:**
- Never resets
- Shows total lifetime achievement
- Includes all historical completions

### Switching Between Periods

**User Experience:**
- Users can toggle between "All-Time" and "This Week" views
- Toggle is instant - no page refresh needed
- System recalculates rankings based on selected period
- Rankings update immediately

---

## 4. Weekly Winners

### Selection Process

**How Winners Are Chosen:**
- Uses the same weekly ranking calculation
- Takes only the top 3 users from the current week
- Calculated using the same points system and ranking criteria

**Display Information:**
- Shows top 3 users with special badges (1st, 2nd, 3rd)
- Displays username, profile picture, points, and completed count
- Updates automatically as rankings change

### Reset Cycle

**Weekly Reset:**
- Resets every Monday at 00:00 UTC automatically
- Previous week's winners are replaced
- New week starts with fresh competition

**User Experience:**
- Winners are prominently displayed in a dedicated section
- Visual distinction with badges and special styling
- Motivates users to compete for top positions

---

## 5. Real-Time Updates

### Two Update Mechanisms

The system uses a dual approach to ensure leaderboard stays current:

#### Mechanism 1: Server-Sent Events (SSE) - Background Polling

**How It Works:**
1. When leaderboard opens, browser establishes persistent connection to server
2. Server sends updates every 10 seconds automatically
3. Browser receives new data and updates display
4. Connection remains open until leaderboard is closed or page is left

**Benefits:**
- Updates happen automatically without user action
- No manual refresh needed
- Low overhead - single connection per user

**Limitations:**
- Up to 10 seconds delay between updates
- Not instant for individual actions

#### Mechanism 2: Manual Refetch - Immediate Updates

**How It Works:**
1. When user marks problem as completed, system immediately fetches latest leaderboard
2. This happens right after completion is saved
3. Leaderboard updates instantly with new rankings

**Benefits:**
- Instant feedback for user actions
- Users see their rank change immediately
- No waiting for next SSE poll

**When It Triggers:**
- After marking single problem as completed
- After bulk marking multiple problems as completed
- Only if leaderboard is currently visible

### Combined Approach

**Why Both Mechanisms:**
- **SSE**: Ensures leaderboard stays current even when user is inactive
- **Manual Refetch**: Provides instant feedback for user's own actions
- **Together**: Best of both worlds - instant updates + continuous synchronization

---

## 6. Complete Data Flow

### When User Marks Problem as Completed

**Step 1: User Action**
- User clicks "Mark as Completed" on a problem
- Frontend sends completion request to backend

**Step 2: Backend Processing**
- System saves completion status (`isCompleted: true`)
- Records completion timestamp (`completedAt: current time`)
- Stores problem difficulty level

**Step 3: Points Calculation**
- System identifies problem difficulty (Easy/Medium/Hard)
- Calculates points based on difficulty
- Adds points to user's total score
- Updates user's completed count

**Step 4: Ranking Recalculation**
- System recalculates ALL users' rankings
- Aggregates each user's completed problems
- Sums points based on difficulty
- Sorts users by four-level criteria
- Assigns sequential ranks

**Step 5: Real-Time Update**
- If leaderboard is open, immediate refetch occurs
- SSE stream continues to send updates every 10 seconds
- Frontend receives new data

**Step 6: Display Update**
- Leaderboard refreshes with new rankings
- User sees updated position immediately
- Points and counts are updated

### When Leaderboard Opens

**Step 1: Initial Load**
- System fetches current leaderboard data
- Fetches weekly winners data
- Displays both simultaneously

**Step 2: SSE Connection**
- Establishes persistent connection to server
- Begins receiving updates every 10 seconds
- Updates display automatically

**Step 3: User Interaction**
- User can switch between All-Time and Weekly views
- User can search for themselves
- User can expand to see more users

---

## 7. Search Functionality

### How Search Works

**Search Process:**
1. User types username or email in search box
2. System filters currently loaded leaderboard
3. Shows only matching users
4. If user not found in current set, suggests showing more

**Search Limitations:**
- Only searches currently loaded leaderboard (default: top 10)
- To find users beyond top 10, user must expand leaderboard
- Search is client-side filtering (not server-side)

### User Experience

**Search Use Cases:**
- Users want to find their own rank
- Users want to check specific users' positions
- Users want to see where they stand

**Search Feedback:**
- If user not found in top N, system suggests expanding
- Clear indication when search returns no results
- Instant filtering as user types

---

## 8. Performance Optimizations

### Database Efficiency

**Aggregation Pipeline:**
- Uses MongoDB aggregation for efficient querying
- All calculations done at database level
- Minimizes data transfer

**Indexing:**
- Indexed fields for fast queries:
  - User ID
  - Completion status
  - Completion timestamp
  - Problem difficulty

**Filtering:**
- Date filtering done at database level
- Only relevant data is retrieved
- Reduces processing overhead

### Network Efficiency

**SSE Connection:**
- Single persistent connection per user
- Efficient data push mechanism
- Low bandwidth usage

**Manual Refetch:**
- Only fetches when needed
- Combines leaderboard and winners in single request
- Limits results to reduce data transfer

**Parallel Fetching:**
- Leaderboard and winners fetched simultaneously
- Reduces total load time

### Frontend Efficiency

**React Optimization:**
- Updates only when data changes
- Re-renders only affected components
- Efficient state management

**Connection Management:**
- SSE connection cleaned up when leaderboard closes
- Prevents memory leaks
- Efficient resource usage

---

## 9. User Experience Flow

### Scenario 1: User Completes a Problem

**User Journey:**
1. User marks problem as completed
2. System saves completion
3. If leaderboard is open, updates immediately
4. User sees their rank change instantly
5. SSE continues to update every 10 seconds

**User Experience:**
- Immediate visual feedback
- See rank improvement instantly
- Motivated to complete more problems

### Scenario 2: User Opens Leaderboard

**User Journey:**
1. User clicks leaderboard strip
2. System loads top 10 (All-Time by default)
3. SSE connection opens
4. User sees current rankings
5. User can switch to Weekly or search

**User Experience:**
- Fast initial load
- Smooth transitions
- Easy to navigate

### Scenario 3: Weekly Reset

**Automatic Process:**
1. Monday 00:00 UTC arrives
2. Weekly rankings filter to new week's completions
3. Weekly winners recalculate from new week's data
4. All-Time rankings remain unchanged
5. Users see updated weekly rankings

**User Experience:**
- Fresh competition every week
- Clear distinction between weekly and all-time
- Motivation to compete weekly

---

## 10. Technical Architecture

### Backend Components

**Leaderboard Computation:**
- MongoDB aggregation pipeline
- Efficient database-level calculations
- Handles large user bases

**Points Calculation:**
- Difficulty-based scoring system
- Automatic point assignment
- Real-time calculation

**Time Filtering:**
- Weekly window calculation
- UTC-based time handling
- Automatic reset logic

**SSE Streaming:**
- Server-Sent Events implementation
- Persistent connections
- Automatic reconnection

**Ranking Algorithm:**
- Multi-criteria sorting
- Deterministic ranking
- Unique rank assignment

### Frontend Components

**State Management:**
- React state for leaderboard data
- Efficient state updates
- Optimized re-renders

**SSE Integration:**
- EventSource API usage
- Event handling
- Connection management

**Manual Refetch:**
- Triggered on completion
- Immediate updates
- Error handling

**UI Components:**
- Tabbed interface
- Search functionality
- Expandable list
- Real-time rendering

---

## 11. Edge Cases

### No Users in Leaderboard

**Handling:**
- Displays "No entries yet" message
- Graceful empty state
- Encourages first completions

### Same Points for Multiple Users

**Handling:**
- Resolved by secondary criteria (completed count)
- If still equal, tertiary criteria (last completion time)
- Final tie-breaker: User ID ensures unique ranks

### User Completes Problem While Leaderboard Closed

**Handling:**
- Completion is saved normally
- When leaderboard opens, fetches latest data
- SSE ensures user sees current rankings
- No data loss

### Network Issues

**Handling:**
- SSE automatically reconnects
- Manual refetch retries on failure
- Graceful error handling
- User sees appropriate error messages

### Weekly Reset Mid-Session

**Handling:**
- Next SSE update reflects new week
- User can switch views to see changes
- All-Time rankings remain accurate
- Smooth transition

### Concurrent Completions

**Handling:**
- Each completion processed independently
- Rankings recalculated after each completion
- SSE updates ensure all users see current state
- No race conditions

---

## 12. Key Features Summary

### Unique Rankings
- **No Tied Ranks**: Every user has a distinct rank
- **Deterministic**: Consistent and predictable
- **Fair**: Based on clear criteria

### Points-Based System
- **Rewards Difficulty**: Harder problems = more points
- **Clear Scoring**: Easy=10, Medium=20, Hard=30
- **Motivates Progress**: Encourages tackling challenges

### Time-Windowed Rankings
- **Weekly Rankings**: Reset every Monday
- **All-Time Rankings**: Cumulative lifetime progress
- **Easy Switching**: Toggle between views instantly

### Real-Time Updates
- **SSE Streaming**: Automatic updates every 10 seconds
- **Manual Refetch**: Instant updates on user actions
- **No Refresh Needed**: Updates happen automatically

### User-Friendly Features
- **Search Functionality**: Find yourself or others
- **Expandable List**: See more than top 10
- **Visual Indicators**: Clear badges and styling
- **Clear Display**: Points and counts shown prominently

---

## 13. System Requirements

### Backend Requirements
- MongoDB database with proper indexing
- Server-Sent Events support
- UTC timezone handling
- Efficient aggregation queries

### Frontend Requirements
- EventSource API support
- React state management
- Real-time UI updates
- Error handling

### Performance Requirements
- Fast query response (< 500ms)
- Efficient SSE connections
- Scalable to thousands of users
- Real-time updates

---

## 14. Future Enhancements

### Potential Improvements
- **Pagination**: Load more users incrementally
- **Filters**: Filter by category or difficulty
- **Historical Data**: View past weeks' rankings
- **Achievements**: Badges for milestones
- **Notifications**: Alert when rank changes
- **Export**: Download rankings as CSV

---

## Conclusion

The DSA Leaderboard System provides a comprehensive, real-time ranking mechanism that accurately tracks user progress, encourages competition, and motivates users to complete more challenging problems. With its dual update mechanism, unique ranking system, and user-friendly interface, it offers an engaging and fair competitive environment for DSA problem solving.

---

**Document Version**: 1.0  
**Last Updated**: 2024  
**Maintained By**: Development Team

