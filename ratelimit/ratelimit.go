package ratelimit

import (
	log "animalsEncyclopedia/logger"
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"golang.org/x/time/rate"
)

const DefaultRequestsPerMinute = 5

const DefaultCleanupInterval = 1 * time.Minute

const DefaultExpiry = 10 * time.Minute

type bucket struct {
	limiter  *rate.Limiter
	lastSeen time.Time
}

type PostLimiter struct {
	visitors        map[string]*bucket
	requestLimit    int
	cleanupInterval time.Duration
	expiry          time.Duration
	sync.RWMutex
}

type PostLimiterOption func(*PostLimiter)

// WithRequestsPerMinute sets the number of requests to allow per minute.
func WithRequestsPerMinute(requestLimit int) PostLimiterOption {
	return func(p *PostLimiter) {
		p.requestLimit = requestLimit
	}
}

// WithCleanupInterval sets the interval between cleaning up stale entries in
// the rate limit client list
func WithCleanupInterval(interval time.Duration) PostLimiterOption {
	return func(p *PostLimiter) {
		p.cleanupInterval = interval
	}
}

// WithExpiry sets the amount of time to store client entries before they are
// considered stale.
func WithExpiry(expiry time.Duration) PostLimiterOption {
	return func(p *PostLimiter) {
		p.expiry = expiry
	}
}

// NewPostLimiter returns a new instance of a PostLimiter
func NewPostLimiter(opts ...PostLimiterOption) *PostLimiter {
	limiter := &PostLimiter{
		visitors:        make(map[string]*bucket),
		requestLimit:    DefaultRequestsPerMinute,
		cleanupInterval: DefaultCleanupInterval,
		expiry:          DefaultExpiry,
	}
	for _, opt := range opts {
		opt(limiter)
	}
	go limiter.pollCleanup()
	return limiter
}

func (limiter *PostLimiter) pollCleanup() {
	ticker := time.NewTicker(time.Duration(limiter.cleanupInterval) * time.Second)
	for range ticker.C {
		limiter.Cleanup()
	}
}

// Cleanup removes any buckets that were last seen past the configured expiry.
func (limiter *PostLimiter) Cleanup() {
	limiter.Lock()
	defer limiter.Unlock()
	for ip, bucket := range limiter.visitors {
		if time.Since(bucket.lastSeen) >= limiter.expiry {
			delete(limiter.visitors, ip)
		}
	}
}

func (limiter *PostLimiter) addBucket(ip string) *bucket {
	limiter.Lock()
	defer limiter.Unlock()
	limit := rate.NewLimiter(rate.Every(time.Minute/time.Duration(limiter.requestLimit)), limiter.requestLimit)
	b := &bucket{
		limiter: limit,
	}
	limiter.visitors[ip] = b
	return b
}

func (limiter *PostLimiter) allow(ip string) bool {
	// Check if we have a limiter already active for this clientIP
	limiter.RLock()
	bucket, exists := limiter.visitors[ip]
	limiter.RUnlock()
	if !exists {
		bucket = limiter.addBucket(ip)
	}
	// Update the lastSeen for this bucket to assist with cleanup
	limiter.Lock()
	defer limiter.Unlock()
	bucket.lastSeen = time.Now()
	return bucket.limiter.Allow()
}

func (limiter *PostLimiter) LimitGin() gin.HandlerFunc {
	return func(c *gin.Context) {
		clientIP := c.ClientIP()

		if c.Request.Method == http.MethodPost && !limiter.allow(clientIP) {
			log.Error("Rate limit exceeded for IP: " + clientIP)
			c.JSON(http.StatusTooManyRequests, gin.H{
				"error":   "too many requests",
				"message": "please try again later",
			})
			c.Abort()
			return
		}

		c.Next()
	}
}
