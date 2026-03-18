# Climbing Stairs

**Difficulty:** Easy
**LeetCode:** https://leetcode.com/problems/climbing-stairs/

## Description

You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?

## In-depth Explanation

This is a classic dynamic programming problem that maps directly to the Fibonacci sequence. At each step i, you could have arrived from step i-1 (one step) or step i-2 (two steps). So the number of ways to reach step i equals the sum of ways to reach step i-1 and step i-2.

## Brute Force Intuition

Use recursion. At each step, branch into "take 1" and "take 2". The recursion tree has massive overlap — `climb(3)` is computed many times.

## Brute Force Code

```java
class Solution {
    public int climbStairs(int n) {
        if (n <= 1) return 1;
        return climbStairs(n - 1) + climbStairs(n - 2);
    }
}
```

## Brute Force Complexity

Time: O(2^n)
Space: O(n)

## Optimal Intuition

Only need last two values at any point — iterate bottom-up with two variables.

## Optimal Code

```java
class Solution {
    public int climbStairs(int n) {
        if (n <= 1) return 1;
        int a = 1, b = 1;
        for (int i = 2; i <= n; i++) {
            int t = a + b; a = b; b = t;
        }
        return b;
    }
}
```

## Optimal Complexity

Time: O(n)
Space: O(1)

---

# Two Sum

**Difficulty:** Easy
**LeetCode:** https://leetcode.com/problems/two-sum/

## Description

Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.

## In-depth Explanation

For each number, we need to find if its complement (target - num) exists in the array. The brute force checks every pair. The optimal approach uses a hash map to look up complements in O(1).

## Brute Force Intuition

Check every pair (i, j) where i < j. If nums[i] + nums[j] == target, return [i, j].

## Brute Force Code

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        for (int i = 0; i < nums.length; i++)
            for (int j = i + 1; j < nums.length; j++)
                if (nums[i] + nums[j] == target)
                    return new int[]{i, j};
        return new int[]{};
    }
}
```

## Brute Force Complexity

Time: O(n^2)
Space: O(1)

## Optimal Intuition

Use a HashMap. For each number, check if `target - num` already exists in the map. If yes, we found our pair. If no, add current number to the map.

## Optimal Code

```java
class Solution {
    public int[] twoSum(int[] nums, int target) {
        Map<Integer, Integer> map = new HashMap<>();
        for (int i = 0; i < nums.length; i++) {
            int comp = target - nums[i];
            if (map.containsKey(comp))
                return new int[]{map.get(comp), i};
            map.put(nums[i], i);
        }
        return new int[]{};
    }
}
```

## Optimal Complexity

Time: O(n)
Space: O(n)

## Optimal Hints

- What data structure gives O(1) lookup?
- You only need one pass through the array
- Store index as value, number as key

---

# Valid Parentheses

**Difficulty:** Easy
**LeetCode:** https://leetcode.com/problems/valid-parentheses/

## Description

Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if open brackets are closed by the same type in the correct order.

## Optimal Intuition

Use a stack. Push opening brackets, pop on closing brackets and check if they match.

## Optimal Code

```java
class Solution {
    public boolean isValid(String s) {
        Stack<Character> stack = new Stack<>();
        for (char c : s.toCharArray()) {
            if (c == '(' || c == '{' || c == '[') stack.push(c);
            else {
                if (stack.isEmpty()) return false;
                char top = stack.pop();
                if (c == ')' && top != '(') return false;
                if (c == '}' && top != '{') return false;
                if (c == ']' && top != '[') return false;
            }
        }
        return stack.isEmpty();
    }
}
```

## Optimal Complexity

Time: O(n)
Space: O(n)

## Optimal Hints

- LIFO order matches nesting order perfectly
- Don't forget to check stack is empty at the end
